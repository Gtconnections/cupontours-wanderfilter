/**
 * Placeholder for an untyped external API payload (backend response shapes vary between
 * array/object, wrapped in .data/.result, and field names aren't guaranteed) that callers
 * duck-type with fallback chains. Centralizing the escape hatch here keeps `any` confined
 * to a single, documented location instead of scattered across every mapper function.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RawApiItem = any;
