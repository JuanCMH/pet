import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertOwnsDocument, requireCurrentUser } from "./lib/access";

export const create = mutation({
  args: {
    postId: v.id("forumPosts"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("El post no existe.");
    }

    const commentId = await ctx.db.insert("forumComments", {
      postId: args.postId,
      userId: user._id,
      content: args.content,
    });

    await ctx.db.patch(args.postId, {
      totalComments: post.totalComments + 1,
    });

    return commentId;
  },
});

export const update = mutation({
  args: {
    commentId: v.id("forumComments"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("El comentario no existe.");
    }

    assertOwnsDocument(comment, user);
    await ctx.db.patch(args.commentId, { content: args.content });
    return args.commentId;
  },
});

export const remove = mutation({
  args: { commentId: v.id("forumComments") },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      return null;
    }

    assertOwnsDocument(comment, user);

    await ctx.db.delete(args.commentId);

    const post = await ctx.db.get(comment.postId);
    if (post) {
      await ctx.db.patch(post._id, {
        totalComments: Math.max(0, post.totalComments - 1),
      });
    }

    return null;
  },
});

export const listByPost = query({
  args: {
    postId: v.id("forumPosts"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const page = await ctx.db
      .query("forumComments")
      .withIndex("by_postId", (q) => q.eq("postId", args.postId))
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      ...page,
      page: await Promise.all(
        page.page.map(async (comment) => ({
          ...comment,
          author: await ctx.db.get(comment.userId),
        })),
      ),
    };
  },
});
