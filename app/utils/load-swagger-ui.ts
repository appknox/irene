import { waitForPromise } from '@ember/test-waiters';

// swagger-ui ships no type defs and is heavy (~MBs); load it on demand
// so it's only fetched when a public-api-docs component actually renders.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let swaggerUIPromise: Promise<any> | null = null;

/** Dynamically imports swagger-ui and caches the import so it only fetches once. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function loadSwaggerUI(): Promise<any> {
  if (!swaggerUIPromise) {
    swaggerUIPromise = waitForPromise(
      // @ts-expect-error no type defs
      import('swagger-ui').then((module) => module.default)
    );
  }

  return swaggerUIPromise;
}
