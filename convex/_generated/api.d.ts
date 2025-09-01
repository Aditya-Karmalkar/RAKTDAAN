/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as admin from "../admin.js";
import type * as auth from "../auth.js";
import type * as campaigns from "../campaigns.js";
import type * as contact from "../contact.js";
import type * as donors from "../donors.js";
import type * as fileStorage from "../fileStorage.js";
import type * as gallery from "../gallery.js";
import type * as hospitals from "../hospitals.js";
import type * as http from "../http.js";
import type * as router from "../router.js";
import type * as seedData from "../seedData.js";
import type * as teams from "../teams.js";
import type * as testUtils from "../testUtils.js";
import type * as testimonials from "../testimonials.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  auth: typeof auth;
  campaigns: typeof campaigns;
  contact: typeof contact;
  donors: typeof donors;
  fileStorage: typeof fileStorage;
  gallery: typeof gallery;
  hospitals: typeof hospitals;
  http: typeof http;
  router: typeof router;
  seedData: typeof seedData;
  teams: typeof teams;
  testUtils: typeof testUtils;
  testimonials: typeof testimonials;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
