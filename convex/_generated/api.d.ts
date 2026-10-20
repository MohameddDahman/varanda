/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin_auth from "../admin/auth.js";
import type * as admin_content from "../admin/content.js";
import type * as admin_inquiries from "../admin/inquiries.js";
import type * as admin_overview from "../admin/overview.js";
import type * as admin_photos from "../admin/photos.js";
import type * as admin_projects from "../admin/projects.js";
import type * as content from "../content.js";
import type * as inquiries from "../inquiries.js";
import type * as lib_admin from "../lib/admin.js";
import type * as lib_photos from "../lib/photos.js";
import type * as projects from "../projects.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "admin/auth": typeof admin_auth;
  "admin/content": typeof admin_content;
  "admin/inquiries": typeof admin_inquiries;
  "admin/overview": typeof admin_overview;
  "admin/photos": typeof admin_photos;
  "admin/projects": typeof admin_projects;
  content: typeof content;
  inquiries: typeof inquiries;
  "lib/admin": typeof lib_admin;
  "lib/photos": typeof lib_photos;
  projects: typeof projects;
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
