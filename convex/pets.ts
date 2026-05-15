import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  ensureCurrentUser,
  getCurrentUser,
  requireCurrentUser,
  requirePetOwner,
  requirePrimaryPetOwner,
  resolveStorageUrl,
} from "./lib/access";
import { ownerRole, petSex, petSpecies } from "./validators";

export const create = mutation({
  args: {
    name: v.string(),
    sex: petSex,
    species: petSpecies,
    breed: v.optional(v.string()),
    birthDate: v.optional(v.number()),
    photo: v.optional(v.id("_storage")),
    condition: v.optional(v.string()),
    collarId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ensureCurrentUser(ctx);
    const petId = await ctx.db.insert("pets", args);

    await ctx.db.insert("petOwners", {
      petId,
      userId: user._id,
      role: "primary",
    });

    return petId;
  },
});

export const update = mutation({
  args: {
    petId: v.id("pets"),
    name: v.optional(v.string()),
    sex: v.optional(petSex),
    species: v.optional(petSpecies),
    breed: v.optional(v.string()),
    birthDate: v.optional(v.number()),
    photo: v.optional(v.id("_storage")),
    condition: v.optional(v.string()),
    collarId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    await requirePetOwner(ctx, args.petId, user._id);

    await ctx.db.patch(args.petId, {
      ...(args.name !== undefined ? { name: args.name } : {}),
      ...(args.sex !== undefined ? { sex: args.sex } : {}),
      ...(args.species !== undefined ? { species: args.species } : {}),
      ...(args.breed !== undefined ? { breed: args.breed } : {}),
      ...(args.birthDate !== undefined ? { birthDate: args.birthDate } : {}),
      ...(args.photo !== undefined ? { photo: args.photo } : {}),
      ...(args.condition !== undefined ? { condition: args.condition } : {}),
      ...(args.collarId !== undefined ? { collarId: args.collarId } : {}),
    });

    return args.petId;
  },
});

export const remove = mutation({
  args: { petId: v.id("pets") },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    await requirePrimaryPetOwner(ctx, args.petId, user._id);

    for await (const owner of ctx.db
      .query("petOwners")
      .withIndex("by_petId", (q) => q.eq("petId", args.petId))) {
      await ctx.db.delete(owner._id);
    }

    for await (const log of ctx.db
      .query("medicationLogs")
      .withIndex("by_petId", (q) => q.eq("petId", args.petId))) {
      await ctx.db.delete(log._id);
    }

    for await (const medication of ctx.db
      .query("medications")
      .withIndex("by_petId", (q) => q.eq("petId", args.petId))) {
      await ctx.db.delete(medication._id);
    }

    await ctx.db.delete(args.petId);
    return null;
  },
});

export const getById = query({
  args: { petId: v.id("pets") },
  handler: async (ctx, args) => {
    const pet = await ctx.db.get(args.petId);
    if (!pet) {
      return null;
    }

    return {
      ...pet,
      photoUrl: await resolveStorageUrl(ctx, pet.photo),
    };
  },
});

export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const ownerships = await ctx.db
      .query("petOwners")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .take(100);

    return await Promise.all(
      ownerships.map(async (ownership) => {
        const pet = await ctx.db.get(ownership.petId);
        if (!pet) {
          return null;
        }

        return {
          ...pet,
          role: ownership.role,
          photoUrl: await resolveStorageUrl(ctx, pet.photo),
        };
      }),
    );
  },
});

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    const ownerships = await ctx.db
      .query("petOwners")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .take(100);

    const pets = await Promise.all(
      ownerships.map(async (ownership) => {
        const pet = await ctx.db.get(ownership.petId);
        if (!pet) {
          return null;
        }

        return {
          ...pet,
          role: ownership.role,
          photoUrl: await resolveStorageUrl(ctx, pet.photo),
        };
      }),
    );

    return pets.filter((pet) => pet !== null);
  },
});

export const addOwner = mutation({
  args: {
    petId: v.id("pets"),
    userId: v.id("users"),
    role: ownerRole,
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    await requirePrimaryPetOwner(ctx, args.petId, user._id);

    const existingOwner = await ctx.db
      .query("petOwners")
      .withIndex("by_petId_and_userId", (q) =>
        q.eq("petId", args.petId).eq("userId", args.userId),
      )
      .unique();

    if (existingOwner) {
      await ctx.db.patch(existingOwner._id, { role: args.role });
      return existingOwner._id;
    }

    return await ctx.db.insert("petOwners", {
      petId: args.petId,
      userId: args.userId,
      role: args.role,
    });
  },
});

export const removeOwner = mutation({
  args: {
    petId: v.id("pets"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    await requirePrimaryPetOwner(ctx, args.petId, user._id);

    const ownerToRemove = await ctx.db
      .query("petOwners")
      .withIndex("by_petId_and_userId", (q) =>
        q.eq("petId", args.petId).eq("userId", args.userId),
      )
      .unique();

    if (!ownerToRemove) {
      return null;
    }

    if (ownerToRemove.role === "primary") {
      const primaryOwners = await ctx.db
        .query("petOwners")
        .withIndex("by_petId_and_role", (q) =>
          q.eq("petId", args.petId).eq("role", "primary"),
        )
        .take(2);

      if (primaryOwners.length <= 1) {
        throw new Error("No puedes eliminar al último owner principal.");
      }
    }

    await ctx.db.delete(ownerToRemove._id);
    return null;
  },
});

export const listOwners = query({
  args: { petId: v.id("pets") },
  handler: async (ctx, args) => {
    const ownerships = await ctx.db
      .query("petOwners")
      .withIndex("by_petId", (q) => q.eq("petId", args.petId))
      .take(100);

    return await Promise.all(
      ownerships.map(async (ownership) => {
        const owner = await ctx.db.get(ownership.userId);
        return {
          ...ownership,
          user: owner,
        };
      }),
    );
  },
});

export const listLinkedCollarIds = query({
  args: {},
  handler: async (ctx) => {
    const pets = await ctx.db.query("pets").collect();
    return pets
      .map((pet) => pet.collarId)
      .filter((collarId): collarId is string => Boolean(collarId));
  },
});
