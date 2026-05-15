import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  ensureCurrentUser,
  getCurrentUser,
  resolveStorageUrl,
} from "./lib/access";
import { documentType } from "./validators";

export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return null;
    }

    const identity = await ctx.auth.getUserIdentity();

    return {
      ...user,
      name: user.name ?? identity?.name,
      email: user.email ?? identity?.email,
      image: user.image ?? identity?.pictureUrl,
      avatarUrl: await resolveStorageUrl(ctx, user.avatar),
    };
  },
});

export const getById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return null;
    }

    return {
      ...user,
      avatarUrl: await resolveStorageUrl(ctx, user.avatar),
    };
  },
});

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatar: v.optional(v.id("_storage")),
    documentType: v.optional(documentType),
    documentNumber: v.optional(v.string()),
    address: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ensureCurrentUser(ctx);

    await ctx.db.patch(user._id, {
      ...(args.name !== undefined ? { name: args.name } : {}),
      ...(args.phone !== undefined ? { phone: args.phone } : {}),
      ...(args.bio !== undefined ? { bio: args.bio } : {}),
      ...(args.avatar !== undefined ? { avatar: args.avatar } : {}),
      ...(args.documentType !== undefined
        ? { documentType: args.documentType }
        : {}),
      ...(args.documentNumber !== undefined
        ? { documentNumber: args.documentNumber }
        : {}),
      ...(args.address !== undefined ? { address: args.address } : {}),
    });

    return user._id;
  },
});
