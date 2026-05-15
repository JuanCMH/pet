import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireCurrentUser, requirePetOwner } from "./lib/access";

export const log = mutation({
  args: {
    medicationId: v.id("medications"),
    administeredAt: v.number(),
    skipped: v.boolean(),
    skipReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const medication = await ctx.db.get(args.medicationId);
    if (!medication) {
      throw new Error("El medicamento no existe.");
    }

    await requirePetOwner(ctx, medication.petId, user._id);

    return await ctx.db.insert("medicationLogs", {
      medicationId: args.medicationId,
      petId: medication.petId,
      administeredBy: user._id,
      administeredAt: args.administeredAt,
      skipped: args.skipped,
      skipReason: args.skipReason,
    });
  },
});

export const remove = mutation({
  args: { logId: v.id("medicationLogs") },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const medicationLog = await ctx.db.get(args.logId);
    if (!medicationLog) {
      return null;
    }

    await requirePetOwner(ctx, medicationLog.petId, user._id);
    await ctx.db.delete(args.logId);
    return null;
  },
});

export const listByMedication = query({
  args: {
    medicationId: v.id("medications"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("medicationLogs")
      .withIndex("by_medicationId", (q) =>
        q.eq("medicationId", args.medicationId),
      )
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const listByPet = query({
  args: {
    petId: v.id("pets"),
    from: v.optional(v.number()),
    to: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("medicationLogs")
      .withIndex("by_petId_and_administeredAt", (q) => {
        const byPet = q.eq("petId", args.petId);
        if (args.from !== undefined && args.to !== undefined) {
          return byPet
            .gte("administeredAt", args.from)
            .lte("administeredAt", args.to);
        }
        if (args.from !== undefined) {
          return byPet.gte("administeredAt", args.from);
        }
        if (args.to !== undefined) {
          return byPet.lte("administeredAt", args.to);
        }
        return byPet;
      })
      .order("desc")
      .take(200);

    return logs;
  },
});
