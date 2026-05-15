import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  getCurrentUser,
  requireCurrentUser,
  requirePetOwner,
  requirePrimaryPetOwner,
  resolveStorageUrl,
} from "./lib/access";
import { frequencyUnit } from "./validators";

export const create = mutation({
  args: {
    petId: v.id("pets"),
    name: v.string(),
    purpose: v.string(),
    dosage: v.string(),
    frequencyValue: v.number(),
    frequencyUnit,
    startDate: v.number(),
    endDate: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    await requirePetOwner(ctx, args.petId, user._id);

    return await ctx.db.insert("medications", {
      ...args,
      active: true,
      createdBy: user._id,
    });
  },
});

export const update = mutation({
  args: {
    medicationId: v.id("medications"),
    name: v.optional(v.string()),
    purpose: v.optional(v.string()),
    dosage: v.optional(v.string()),
    frequencyValue: v.optional(v.number()),
    frequencyUnit: v.optional(frequencyUnit),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const medication = await ctx.db.get(args.medicationId);
    if (!medication) {
      throw new Error("El medicamento no existe.");
    }

    await requirePetOwner(ctx, medication.petId, user._id);
    await ctx.db.patch(args.medicationId, {
      ...(args.name !== undefined ? { name: args.name } : {}),
      ...(args.purpose !== undefined ? { purpose: args.purpose } : {}),
      ...(args.dosage !== undefined ? { dosage: args.dosage } : {}),
      ...(args.frequencyValue !== undefined
        ? { frequencyValue: args.frequencyValue }
        : {}),
      ...(args.frequencyUnit !== undefined
        ? { frequencyUnit: args.frequencyUnit }
        : {}),
      ...(args.startDate !== undefined ? { startDate: args.startDate } : {}),
      ...(args.endDate !== undefined ? { endDate: args.endDate } : {}),
      ...(args.notes !== undefined ? { notes: args.notes } : {}),
    });

    return args.medicationId;
  },
});

export const setActive = mutation({
  args: {
    medicationId: v.id("medications"),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const medication = await ctx.db.get(args.medicationId);
    if (!medication) {
      throw new Error("El medicamento no existe.");
    }

    await requirePetOwner(ctx, medication.petId, user._id);
    await ctx.db.patch(args.medicationId, { active: args.active });
    return args.medicationId;
  },
});

export const remove = mutation({
  args: { medicationId: v.id("medications") },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const medication = await ctx.db.get(args.medicationId);
    if (!medication) {
      return null;
    }

    await requirePrimaryPetOwner(ctx, medication.petId, user._id);

    for await (const log of ctx.db
      .query("medicationLogs")
      .withIndex("by_medicationId", (q) =>
        q.eq("medicationId", args.medicationId),
      )) {
      await ctx.db.delete(log._id);
    }

    await ctx.db.delete(args.medicationId);
    return null;
  },
});

export const listByPet = query({
  args: {
    petId: v.id("pets"),
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const medications = args.activeOnly
      ? await ctx.db
          .query("medications")
          .withIndex("by_petId_and_active", (q) =>
            q.eq("petId", args.petId).eq("active", true),
          )
          .take(100)
      : await ctx.db
          .query("medications")
          .withIndex("by_petId", (q) => q.eq("petId", args.petId))
          .take(100);

    return medications;
  },
});

export const getById = query({
  args: { medicationId: v.id("medications") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.medicationId);
  },
});

export const listMine = query({
  args: {
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    const ownerships = await ctx.db
      .query("petOwners")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .take(200);

    const petIds = ownerships.map((o) => o.petId);
    if (petIds.length === 0) {
      return [];
    }

    const results: Array<{
      _id: import("./_generated/dataModel").Id<"medications">;
      _creationTime: number;
      petId: import("./_generated/dataModel").Id<"pets">;
      name: string;
      purpose: string;
      dosage: string;
      frequencyValue: number;
      frequencyUnit: "hours" | "days" | "weeks" | "months";
      startDate: number;
      endDate?: number;
      active: boolean;
      notes?: string;
      pet: {
        _id: import("./_generated/dataModel").Id<"pets">;
        name: string;
        photoUrl: string | null;
      } | null;
    }> = [];

    for (const petId of petIds) {
      const meds = args.activeOnly
        ? await ctx.db
            .query("medications")
            .withIndex("by_petId_and_active", (q) =>
              q.eq("petId", petId).eq("active", true),
            )
            .take(100)
        : await ctx.db
            .query("medications")
            .withIndex("by_petId", (q) => q.eq("petId", petId))
            .take(100);

      const pet = await ctx.db.get(petId);
      const petInfo = pet
        ? {
            _id: pet._id,
            name: pet.name,
            photoUrl: await resolveStorageUrl(ctx, pet.photo),
          }
        : null;

      for (const med of meds) {
        results.push({
          _id: med._id,
          _creationTime: med._creationTime,
          petId: med.petId,
          name: med.name,
          purpose: med.purpose,
          dosage: med.dosage,
          frequencyValue: med.frequencyValue,
          frequencyUnit: med.frequencyUnit,
          startDate: med.startDate,
          endDate: med.endDate,
          active: med.active,
          notes: med.notes,
          pet: petInfo,
        });
      }
    }

    results.sort((a, b) => b._creationTime - a._creationTime);
    return results;
  },
});
