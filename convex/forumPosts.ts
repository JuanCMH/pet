import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertOwnsDocument, requireCurrentUser } from "./lib/access";
import { forumCategory, petSpecies } from "./validators";

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    category: forumCategory,
    species: v.optional(petSpecies),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);

    return await ctx.db.insert("forumPosts", {
      ...args,
      userId: user._id,
      totalComments: 0,
    });
  },
});

export const update = mutation({
  args: {
    postId: v.id("forumPosts"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    category: v.optional(forumCategory),
    species: v.optional(petSpecies),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("El post no existe.");
    }

    assertOwnsDocument(post, user);
    await ctx.db.patch(args.postId, {
      ...(args.title !== undefined ? { title: args.title } : {}),
      ...(args.content !== undefined ? { content: args.content } : {}),
      ...(args.category !== undefined ? { category: args.category } : {}),
      ...(args.species !== undefined ? { species: args.species } : {}),
    });

    return args.postId;
  },
});

export const remove = mutation({
  args: { postId: v.id("forumPosts") },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const post = await ctx.db.get(args.postId);
    if (!post) {
      return null;
    }

    assertOwnsDocument(post, user);

    for await (const comment of ctx.db
      .query("forumComments")
      .withIndex("by_postId", (q) => q.eq("postId", args.postId))) {
      await ctx.db.delete(comment._id);
    }

    await ctx.db.delete(args.postId);
    return null;
  },
});

export const getById = query({
  args: { postId: v.id("forumPosts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) {
      return null;
    }

    return {
      ...post,
      author: await ctx.db.get(post.userId),
    };
  },
});

export const list = query({
  args: {
    category: v.optional(forumCategory),
    species: v.optional(petSpecies),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    let page;

    if (args.category !== undefined && args.species !== undefined) {
      const category = args.category;
      const species = args.species;

      page = await ctx.db
        .query("forumPosts")
        .withIndex("by_category_and_species", (q) =>
          q.eq("category", category).eq("species", species),
        )
        .order("desc")
        .paginate(args.paginationOpts);
    } else if (args.category !== undefined) {
      const category = args.category;

      page = await ctx.db
        .query("forumPosts")
        .withIndex("by_category", (q) => q.eq("category", category))
        .order("desc")
        .paginate(args.paginationOpts);
    } else {
      page = await ctx.db
        .query("forumPosts")
        .order("desc")
        .paginate(args.paginationOpts);
    }

    const postsWithAuthors = await Promise.all(
      page.page.map(async (post) => ({
        ...post,
        author: await ctx.db.get(post.userId),
      })),
    );

    return {
      ...page,
      page: postsWithAuthors,
    };
  },
});

export const search = query({
  args: {
    query: v.string(),
    category: v.optional(forumCategory),
  },
  handler: async (ctx, args) => {
    let posts;

    if (args.category !== undefined) {
      const category = args.category;

      posts = await ctx.db
        .query("forumPosts")
        .withSearchIndex("search_title", (q) =>
          q.search("title", args.query).eq("category", category),
        )
        .take(20);
    } else {
      posts = await ctx.db
        .query("forumPosts")
        .withSearchIndex("search_title", (q) => q.search("title", args.query))
        .take(20);
    }

    return await Promise.all(
      posts.map(async (post) => ({
        ...post,
        author: await ctx.db.get(post.userId),
      })),
    );
  },
});

export const listByUser = query({
  args: {
    userId: v.id("users"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("forumPosts")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});
