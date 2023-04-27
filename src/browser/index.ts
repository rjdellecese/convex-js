/**
 * Tools for accessing Convex in the browser.
 *
 * **If you are using React, use the {@link react} module instead.**
 *
 * ## Usage
 *
 * Create a {@link ConvexHttpClient} to connect to the Convex Cloud.
 *
 * ```typescript
 * import { ConvexHttpClient } from "convex/browser";
 * // typically loaded from an environment variable
 * const address = "https://small-mouse-123.convex.cloud";
 * const convex = new ConvexHttpClient(address);
 * ```
 *
 * @module
 */
export { BaseConvexClient } from "./sync/client.js";
export type {
  ClientOptions,
  MutationOptions,
  SubscribeOptions,
} from "./sync/client.js";
export type {
  OptimisticUpdate,
  OptimisticLocalStore,
} from "./sync/optimistic_updates.js";
export type { QueryToken } from "./sync/udf_path_utils.js";
export { ConvexHttpClient } from "./http_client.js";
export * from "../api/index.js";
export type { QueryJournal } from "./sync/protocol.js";
export type { UserIdentityAttributes } from "./sync/protocol.js";
export type { FunctionResult } from "./sync/function_result.js";
