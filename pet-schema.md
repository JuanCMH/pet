import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
const userType = v.union(v.literal("normal"), v.literal("expert"));

const petSex = v.union(
  v.literal("male"),
  v.literal("female"),
  v.literal("unknown"),
);

const petSpecies = v.union(
  v.literal("dog"),
  v.literal("cat"),
  v.literal("bird"),
  v.literal("rabbit"),
  v.literal("hamster"),
  v.literal("fish"),
  v.literal("reptile"),
  v.literal("other"),
);

const locationType = v.union(
  v.literal("vet_clinic"),
  v.literal("park"),
  v.literal("pet_store"),
  v.literal("grooming"),
  v.literal("shelter"),
  v.literal("training"),
  v.literal("other"),
);

const recordType = v.union(
  v.literal("weight"),
  v.literal("height"),
  v.literal("temperature"),
  v.literal("behavior"),
  v.literal("symptom"),
  v.literal("diet"),
  v.literal("other"),
);

const frequencyUnit = v.union(
  v.literal("hours"),
  v.literal("days"),
  v.literal("weeks"),
  v.literal("months"),
);
const schema = defineSchema({
  ...authTables,

  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    avatar: v.optional(v.id("_storage")),
    phone: v.optional(v.string()),
    userType: userType,
    bio: v.optional(v.string()),
    licenseNumber: v.optional(v.string()),
    specialty: v.optional(v.string()),
    clinicName: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
  })
    .index("email", ["email"])
    .index("userType", ["userType"]),

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
    .index("species", ["species"])
    .searchIndex("search_name", {
      searchField: "name",
    }),

  petOwners: defineTable({
    petId: v.id("pets"),
    userId: v.id("users"),
    role: v.union(v.literal("primary"), v.literal("secondary")),
  })
    .index("petId", ["petId"])
    .index("userId", ["userId"])
    .index("petId_userId", ["petId", "userId"]),

  vetPatients: defineTable({
    vetId: v.id("users"),
    petId: v.id("pets"),
    notes: v.optional(v.string()),
    lastVisit: v.optional(v.number()),
  })
    .index("vetId", ["vetId"])
    .index("petId", ["petId"])
    .index("vetId_petId", ["vetId", "petId"]),

  petRecords: defineTable({
    petId: v.id("pets"),
    userId: v.id("users"),
    type: recordType,
    title: v.string(),
    description: v.optional(v.string()),
    value: v.optional(v.string()),
    unit: v.optional(v.string()),
    date: v.number(),
  })
    .index("petId", ["petId"])
    .index("petId_type", ["petId", "type"])
    .index("userId", ["userId"]),

  collarReadings: defineTable({
    petId: v.id("pets"),
    collarId: v.string(),
    type: v.union(
      v.literal("heart_rate"),
      v.literal("temperature"),
      v.literal("activity"),
      v.literal("sleep"),
      v.literal("location"),
      v.literal("other"),
    ),
    value: v.number(),
    unit: v.string(),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    timestamp: v.number(),
  })
    .index("petId", ["petId"])
    .index("petId_type", ["petId", "type"])
    .index("collarId", ["collarId"])
    .index("petId_timestamp", ["petId", "timestamp"]),

  medications: defineTable({
    petId: v.id("pets"),
    name: v.string(),
    purpose: v.string(),
    dosage: v.string(),
    frequencyValue: v.number(),
    frequencyUnit: frequencyUnit,
    startDate: v.number(),
    endDate: v.optional(v.number()),
    active: v.boolean(),
    notes: v.optional(v.string()),
    prescribedBy: v.optional(v.id("users")),
    createdBy: v.id("users"),
  })
    .index("petId", ["petId"])
    .index("petId_active", ["petId", "active"])
    .index("prescribedBy", ["prescribedBy"]),

  medicationLogs: defineTable({
    medicationId: v.id("medications"),
    petId: v.id("pets"),
    administeredBy: v.id("users"),
    administeredAt: v.number(),
    skipped: v.boolean(),
    skipReason: v.optional(v.string()),
  })
    .index("medicationId", ["medicationId"])
    .index("petId", ["petId"])
    .index("petId_administeredAt", ["petId", "administeredAt"]),

  locations: defineTable({
    name: v.string(),
    type: locationType,
    description: v.optional(v.string()),
    address: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    phone: v.optional(v.string()),
    website: v.optional(v.string()),
    photo: v.optional(v.id("_storage")),
    priceMin: v.optional(v.number()),
    priceMax: v.optional(v.number()),
    openingHours: v.optional(v.string()),
    averageRating: v.optional(v.number()),
    totalReviews: v.optional(v.number()),
    createdBy: v.id("users"),
  })
    .index("type", ["type"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["type"],
    }),

  locationReviews: defineTable({
    locationId: v.id("locations"),
    userId: v.id("users"),
    rating: v.number(),
    comment: v.optional(v.string()),
  })
    .index("locationId", ["locationId"])
    .index("userId", ["userId"])
    .index("locationId_userId", ["locationId", "userId"]),

  forumPosts: defineTable({
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
    category: v.union(
      v.literal("general"),
      v.literal("health"),
      v.literal("nutrition"),
      v.literal("behavior"),
      v.literal("training"),
      v.literal("adoption"),
      v.literal("lost_found"),
      v.literal("other"),
    ),
    species: v.optional(petSpecies),
    pinned: v.optional(v.boolean()),
    locked: v.optional(v.boolean()),
    totalComments: v.optional(v.number()),
    totalLikes: v.optional(v.number()),
  })
    .index("userId", ["userId"])
    .index("category", ["category"])
    .index("category_species", ["category", "species"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["category"],
    }),

  forumComments: defineTable({
    postId: v.id("forumPosts"),
    userId: v.id("users"),
    content: v.string(),
    parentCommentId: v.optional(v.id("forumComments")),
    isExpertAnswer: v.optional(v.boolean()),
  })
    .index("postId", ["postId"])
    .index("userId", ["userId"])
    .index("parentCommentId", ["parentCommentId"]),

  forumLikes: defineTable({
    userId: v.id("users"),
    postId: v.optional(v.id("forumPosts")),
    commentId: v.optional(v.id("forumComments")),
  })
    .index("userId", ["userId"])
    .index("postId_userId", ["postId", "userId"])
    .index("commentId_userId", ["commentId", "userId"]),
});

export default schema;
