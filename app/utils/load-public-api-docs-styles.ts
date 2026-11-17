import { waitForPromise } from '@ember/test-waiters';
import ENV from 'irene/config/environment';

const STYLESHEET_ELEMENT_ID = 'public-api-docs-styles';

let stylesPromise: Promise<void> | null = null;

/**
 * Injects the public-api-docs stylesheet (swagger-ui + overrides) on demand,
 * once, so it only loads when a public-api-docs component actually renders
 * instead of being render-blocking on every page.
 */
export default function loadPublicApiDocsStyles(): Promise<void> {
  if (!stylesPromise) {
    stylesPromise = waitForPromise(
      new Promise<void>((resolve, reject) => {
        if (document.getElementById(STYLESHEET_ELEMENT_ID)) {
          resolve();

          return;
        }

        const link = document.createElement('link');

        link.id = STYLESHEET_ELEMENT_ID;
        link.rel = 'stylesheet';
        link.href = `${ENV.rootURL}assets/public-api-docs.css`;
        link.onload = () => resolve();
        link.onerror = () =>
          reject(new Error('Failed to load public-api-docs styles'));

        document.head.appendChild(link);
      })
    );
  }

  return stylesPromise;
}
