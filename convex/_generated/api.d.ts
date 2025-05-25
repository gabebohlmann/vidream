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
import type * as bunnyActions from "../bunnyActions.js";
import type * as http from "../http.js";
import type * as replykeAuthHttp from "../replykeAuthHttp.js";
import type * as replykeNodeActions from "../replykeNodeActions.js";
import type * as videos from "../videos.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  bunnyActions: typeof bunnyActions;
  http: typeof http;
  replykeAuthHttp: typeof replykeAuthHttp;
  replykeNodeActions: typeof replykeNodeActions;
  videos: typeof videos;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
