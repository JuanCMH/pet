import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import {
  documentType,
  forumCategory,
  frequencyUnit,
  ownerRole,
  petSex,
  petSpecies,
} from "./validators";

export default defineSchema({
  ...authTables,
  users: defineTable({
    tokenIdentifier: v.optional(v.string()),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    avatar: v.optional(v.id("_storage")),
    phone: v.optional(v.string()),
    bio: v.optional(v.string()),
    documentType: v.optional(documentType),
    documentNumber: v.optional(v.string()),
    address: v.optional(v.string()),
  })
    .index("by_tokenIdentifier", ["tokenIdentifier"])
    .index("email", ["email"]),

  pets: defineTable({
    name: v.string(),
    sex: petSex,
    species: petSpecies,
    breed: v.optional(v.string()),
    birthDate: v.optional(v.number()),
    photo: v.optional(v.id("_storage")),
    condition: v.optional(v.string()),
    collarId: v.optional(v.string()),
  })
    .index("by_species", ["species"])
    .index("by_collarId", ["collarId"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["species"],
    }),

  petOwners: defineTable({
    petId: v.id("pets"),
    userId: v.id("users"),
    role: ownerRole,
  })
    .index("by_petId", ["petId"])
    .index("by_userId", ["userId"])
    .index("by_petId_and_userId", ["petId", "userId"])
    .index("by_petId_and_role", ["petId", "role"]),

  medications: defineTable({
    petId: v.id("pets"),
    name: v.string(),
    purpose: v.string(),
    dosage: v.string(),
    frequencyValue: v.number(),
    frequencyUnit,
    startDate: v.number(),
    endDate: v.optional(v.number()),
    active: v.boolean(),
    notes: v.optional(v.string()),
    createdBy: v.id("users"),
  })
    .index("by_petId", ["petId"])
    .index("by_petId_and_active", ["petId", "active"]),

  medicationLogs: defineTable({
    medicationId: v.id("medications"),
    petId: v.id("pets"),
    administeredBy: v.id("users"),
    administeredAt: v.number(),
    skipped: v.boolean(),
    skipReason: v.optional(v.string()),
  })
    .index("by_medicationId", ["medicationId"])
    .index("by_petId", ["petId"])
    .index("by_petId_and_administeredAt", ["petId", "administeredAt"]),

  forumPosts: defineTable({
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
    category: forumCategory,
    species: v.optional(petSpecies),
    totalComments: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_category", ["category"])
    .index("by_category_and_species", ["category", "species"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["category"],
    }),

  forumComments: defineTable({
    postId: v.id("forumPosts"),
    userId: v.id("users"),
    content: v.string(),
  })
    .index("by_postId", ["postId"])
    .index("by_userId", ["userId"]),
});
