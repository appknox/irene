/**
 * @function getAliasName
 * @returns String with correct alias structure - "@{aliasName}"
 */
export const getAliasName = (alias: string): `@${string}` => `@${alias}`;

/**
 * Extracts dynamic parameters from an actual route based on a route template.
 *
 * @param {string} routeTemplate - The route template with placeholders for dynamic parameters.
 * @param {string} actualRoute - The actual route containing dynamic parameter values.
 * @returns {Record<string, string> } An object representing dynamic parameters with their keys and values.
 *
 * @example
 * const routeTemplate = "/path/:id/:slug";
 * const actualRoute = "/path/123/example-slug";
 * const dynamicParams = extractDynamicParams(routeTemplate, actualRoute);
 */

export function extractDynamicSlugs<ParamObj>(
  routeTemplate: string,
  actualRoute: string
): ParamObj {
  const templateRegex = new RegExp(
    routeTemplate.replace(
      /:(\w+)/g,
      (_, paramName) => `(?<${paramName}>[^\\/]+)`
    )
  );

  const match = actualRoute.match(templateRegex);
  const params = match?.groups || {};

  return Object.keys(params).reduce(
    (prev, curr) => ({
      ...prev,
      [curr]: params[curr],
    }),
    {} as ParamObj
  );
}

/**
 * Replaces all slugs in a route with an asterisk.
 *
 * @param {string} route - The route containing slugs.
 * @returns {string} The route with slugs replaced by asterisks.
 *
 */

export function replaceSlugsWithAsterisks(route: string): string {
  const slugRegex = /:[^\\/]+/g;
  const routeWithAsterisks = route.replace(slugRegex, '*');

  return routeWithAsterisks;
}

/**
 * Removes the host from a given URL.
 *
 * @param {string} urlString - The URL to process.
 * @returns {string} The URL without the host.
 *
 * @example
 * const originalUrl = "https://example.com/path/to/resource";
 * const urlWithoutHost = removeHostFromUrl(originalUrl);
 *
 * console.log("URL without Host:", urlWithoutHost);
 * // Output: "/path/to/resource"
 */

export function removeHostFromUrl(urlString: string): string {
  const url = new URL(urlString);
  const urlWithoutHost = url.pathname + url.search + url.hash;

  return urlWithoutHost;
}

/**
 * Returns the corresponding text description for a given vulnerability type.
 *
 * @param {number} vulnType - The numeric code representing the type of vulnerability.
 * @returns {string | undefined} The text description of the vulnerability type
 * (e.g., 'static', 'dynamic', 'manual', 'api'), or `undefined` if the code is not recognized.
 */
export function getVulnerabilityTypeText(vulnType: number): string {
  const typeTextMap = { 1: 'static', 2: 'dynamic', 3: 'manual', 4: 'api' };

  return typeTextMap[vulnType as keyof typeof typeTextMap];
}
