import { getAuthUserId } from "@convex-dev/auth/server";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type ReadCtx = QueryCtx | MutationCtx;

export async function getCurrentUser(ctx: ReadCtx) {
  const authUserId = await getAuthUserId(ctx);
  if (authUserId) {
    return await ctx.db.get(authUserId);
  }

  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  return await ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier),
    )
    .unique();
}

export async function requireCurrentUser(ctx: ReadCtx) {
  const user = await getCurrentUser(ctx);
  if (!user) {
    throw new Error("Debes iniciar sesión para realizar esta acción.");
  }

  return user;
}

export async function ensureCurrentUser(ctx: MutationCtx) {
  const authUserId = await getAuthUserId(ctx);
  if (authUserId) {
    const authUser = await ctx.db.get(authUserId);
    if (authUser) {
      return authUser;
    }
  }

  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Debes iniciar sesión para realizar esta acción.");
  }

  const existingUser = await ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier),
    )
    .unique();

  if (existingUser) {
    return existingUser;
  }

  const userId = await ctx.db.insert("users", {
    tokenIdentifier: identity.tokenIdentifier,
    name: identity.name,
    email: identity.email,
    image: identity.pictureUrl,
  });

  const user = await ctx.db.get(userId);
  if (!user) {
    throw new Error("No se pudo crear el usuario autenticado.");
  }

  return user;
}

export async function getPetOwner(
  ctx: ReadCtx,
  petId: Id<"pets">,
  userId: Id<"users">,
) {
  return await ctx.db
    .query("petOwners")
    .withIndex("by_petId_and_userId", (q) =>
      q.eq("petId", petId).eq("userId", userId),
    )
    .unique();
}

export async function requirePetOwner(
  ctx: ReadCtx,
  petId: Id<"pets">,
  userId: Id<"users">,
) {
  const owner = await getPetOwner(ctx, petId, userId);
  if (!owner) {
    throw new Error("No tienes permiso para acceder a esta mascota.");
  }

  return owner;
}

export async function requirePrimaryPetOwner(
  ctx: ReadCtx,
  petId: Id<"pets">,
  userId: Id<"users">,
) {
  const owner = await requirePetOwner(ctx, petId, userId);
  if (owner.role !== "primary") {
    throw new Error("Solo el owner principal puede realizar esta acción.");
  }

  return owner;
}

export async function resolveStorageUrl(
  ctx: ReadCtx,
  storageId: Id<"_storage"> | undefined,
) {
  if (!storageId) {
    return null;
  }

  return await ctx.storage.getUrl(storageId);
}

export function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

export function assertOwnsDocument(
  document: { userId: Id<"users"> },
  user: Doc<"users">,
) {
  if (document.userId !== user._id) {
    throw new Error("No tienes permiso para modificar este recurso.");
  }
}
