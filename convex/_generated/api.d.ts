/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as forumComments from "../forumComments.js";
import type * as forumPosts from "../forumPosts.js";
import type * as http from "../http.js";
import type * as lib_access from "../lib/access.js";
import type * as medicationLogs from "../medicationLogs.js";
import type * as medications from "../medications.js";
import type * as pets from "../pets.js";
import type * as resend from "../resend.js";
import type * as upload from "../upload.js";
import type * as users from "../users.js";
import type * as validators from "../validators.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  forumComments: typeof forumComments;
  forumPosts: typeof forumPosts;
  http: typeof http;
  "lib/access": typeof lib_access;
  medicationLogs: typeof medicationLogs;
  medications: typeof medications;
  pets: typeof pets;
  resend: typeof resend;
  upload: typeof upload;
  users: typeof users;
  validators: typeof validators;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
