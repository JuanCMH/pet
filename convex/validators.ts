import { v } from "convex/values";

export const documentType = v.union(
  v.literal("cc"),
  v.literal("ti"),
  v.literal("ce"),
);

export const petSex = v.union(
  v.literal("male"),
  v.literal("female"),
  v.literal("unknown"),
);

export const petSpecies = v.union(
  v.literal("dog"),
  v.literal("cat"),
  v.literal("bird"),
  v.literal("rabbit"),
  v.literal("hamster"),
  v.literal("fish"),
  v.literal("reptile"),
  v.literal("other"),
);

export const ownerRole = v.union(v.literal("primary"), v.literal("secondary"));

export const frequencyUnit = v.union(
  v.literal("hours"),
  v.literal("days"),
  v.literal("weeks"),
  v.literal("months"),
);

export const forumCategory = v.union(
  v.literal("general"),
  v.literal("health"),
  v.literal("nutrition"),
  v.literal("behavior"),
  v.literal("training"),
  v.literal("adoption"),
  v.literal("lost_found"),
  v.literal("other"),
);
