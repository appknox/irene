import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import fetch from 'fetch';
import ENV from 'irene/config/environment';
import type { SessionService } from 'irene/adapters/auth-base';

/**
 * Extended request options that include additional properties beyond the standard RequestInit
 */
interface RequestOptions extends RequestInit {
  /** Optional data to be sent as JSON in the request body */
  data?: unknown;
  /** Additional headers to merge with default headers */
  headers?: Record<string, string>;
  /** Optional namespace to override the default API namespace */
  namespace?: string;
  /** Optional host URL to override the default API host */
  host?: string;
  /** Optional Content Type to override the default Content Type */
  contentType?: string | null;
}

/**
 * Structure for default headers sent with every request
 */
interface DefaultHeaders {
  /** Basic authentication token */
  Authorization?: string;
  /** Product identifier header */
  'X-Product': string;
}

export interface AjaxError {
  type: string;
  status: number;
  ok: boolean;
  statusText: string;
  url: string;
  message: string;
  payload: any;
}

const completeUrlRegex = /^(http|https)/;

function isFullURL(url: string): boolean {
  return !!url.match(completeUrlRegex);
}

function startsWithSlash(string: string) {
  return string.charAt(0) === '/';
}

function endsWithSlash(string: string) {
  return string.charAt(string.length - 1) === '/';
}

function removeLeadingSlash(string: string) {
  return string.substring(1);
}

function removeTrailingSlash(string: string) {
  return string.slice(0, -1);
}

function stripSlashes(path: string) {
  // make sure path starts with `/`
  if (startsWithSlash(path)) {
    path = removeLeadingSlash(path);
  }

  // remove end `/`
  if (endsWithSlash(path)) {
    path = removeTrailingSlash(path);
  }
  return path;
}

function haveSameHost(a: string, b: string): boolean {
  const urlA = parseURL(a);
  const urlB = parseURL(b);

  return (
    urlA.protocol === urlB.protocol &&
    urlA.hostname === urlB.hostname &&
    urlA.port === urlB.port
  );
}

/**
 * Parses a URL string into its components using the DOM URL API
 *
 * @param str - The URL string to parse
 * @returns A URL object containing the parsed components
 */
export function parseURL(str: string) {
  const element = document.createElement('a');
  element.href = str;

  return {
    href: element.href,
    protocol: element.protocol,
    hostname: element.hostname,
    port: element.port,
    pathname: element.pathname,
    search: element.search,
    hash: element.hash,
  };
}

/**
 * Converts an object into a URL-encoded form data string
 *
 * @param data - Object containing key-value pairs to encode
 * @returns URL-encoded string in the format `"key1=value1&key2=value2"`
 */
export function buildURLEncodedFormData(data: Record<string, unknown>): string {
  return Object.entries(data)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value ?? ''))}`
    )
    .join('&');
}

/**
 * Creates a FormData object from a key-value pair object
 *
 * @param data - Object containing form fields and their values
 * @returns FormData object containing all the form fields
 */
export function buildMultipartFormData(
  data: Record<string, string | Blob>
): FormData {
  const formData = new FormData();

  for (const [key, value] of Object.entries(data)) {
    formData.append(key, value);
  }

  return formData;
}

export default class IreneAjaxService extends Service {
  @service declare session: SessionService;
  @tracked headers?: Record<string, string>;

  host: string = ENV.host || window.location.origin;

  namespace: string = ENV.namespace;
  trustedHosts: string[] = [];

  /**
   * Returns the default headers for all requests
   * Includes authentication token if available and product identifier
   */
  get defaultHeaders(): DefaultHeaders {
    const token = this.session.data.authenticated.b64token;

    if (token) {
      return {
        Authorization: 'Basic ' + token,
        'X-Product': String(ENV.product),
      };
    }

    return {
      'X-Product': String(ENV.product),
    };
  }

  /**
   * Constructs the complete URL for the API request
   * @param url - The endpoint URL
   * @param options - Optional request options to override the default
   * @returns The complete URL with host and namespace
   */
  private _buildURL(url: string, options: RequestOptions = {}): string {
    if (isFullURL(url)) {
      return url;
    }

    const urlParts = [];

    let host = options.host || this.host;

    if (host) {
      host = endsWithSlash(host) ? removeTrailingSlash(host) : host;
      urlParts.push(host);
    }

    let namespace = options.namespace || this.namespace;

    if (namespace) {
      // If host is given then we need to strip leading slash too( as it will be added through join)
      if (host) {
        namespace = stripSlashes(namespace);
      } else if (endsWithSlash(namespace)) {
        namespace = removeTrailingSlash(namespace);
      }

      // If the URL has already been constructed (presumably, by Ember Data), then we should just leave it alone
      const hasNamespaceRegex = new RegExp(`^(/)?${stripSlashes(namespace)}/`);

      if (!hasNamespaceRegex.test(url)) {
        urlParts.push(namespace);
      }
    }

    // *Only* remove a leading slash when there is host or namespace -- we need to maintain a trailing slash for
    // APIs that differentiate between it being and not being present
    if (startsWithSlash(url) && urlParts.length !== 0) {
      url = removeLeadingSlash(url);
    }

    urlParts.push(url);

    return urlParts.join('/');
  }

  /**
   * Determines whether headers should be sent for a given request
   * @param url - The request URL
   * @param host - Optional host override
   * @returns boolean indicating whether headers should be sent
   */
  private _shouldSendHeaders(url: string, host?: string): boolean {
    host = host || this.host;
    const { hostname } = parseURL(url);

    // Add headers on relative URLs
    if (!isFullURL(url)) {
      return true;
    } else if (
      this.trustedHosts.find((matcher) => this._matchHosts(hostname, matcher))
    ) {
      return true;
    }

    // Add headers on matching host
    return haveSameHost(url, host);
  }

  /**
   * Matches a hostname against a pattern
   * @param hostname - The hostname to check
   * @param pattern - The pattern to match against
   * @returns boolean indicating whether the hostname matches
   */
  private _matchHosts(hostname: string, pattern: string): boolean {
    // Convert pattern to regex-compatible string
    const regexPattern = pattern.replace(/\./g, '\\.').replace(/\*/g, '.*');
    return new RegExp(`^${regexPattern}$`).test(hostname);
  }

  /**
   * Makes an HTTP request to the specified endpoint
   * @param url - The endpoint URL
   * @param options - Request options including method, headers, data, etc.
   * @returns Promise resolving to the JSON response
   * @throws Response object if the request fails
   */
  async makeRequest<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const finalUrl = this._buildURL(url, options);
    const contentType = options.contentType;

    // Only include headers if _shouldSendHeaders returns true
    const headers = this._shouldSendHeaders(finalUrl, options.host)
      ? {
          // For data transfer objects we allow the browser set the content type of the request
          ...(contentType === null
            ? {}
            : { 'Content-Type': contentType || 'application/json' }),
          ...this.defaultHeaders,
          ...options.headers,
        }
      : options.headers || {};

    const fetchOptions: RequestInit = {
      ...options,
      headers,
      body: this.processRequestBody(options.data),
    };

    delete (fetchOptions as RequestOptions).namespace;

    const response = await fetch(finalUrl, fetchOptions);

    if (!response.ok) {
      const parsedResponse = await this.parseResponseText(response);

      const errorResponse = {
        ...response,
        ...(typeof parsedResponse === 'object'
          ? parsedResponse
          : { message: parsedResponse }),
        payload: parsedResponse,
      };

      throw errorResponse;
    }

    return (await this.parseResponseText(response)) as T;
  }

  /**
   * Process request body based on the data type
   *
   * @private
   * @param data - The data to be processed
   * @returns The processed request body
   */
  private processRequestBody(data: unknown): BodyInit | null {
    if (!data) {
      return null;
    }

    if (
      data instanceof FormData ||
      data instanceof Blob ||
      typeof data === 'string'
    ) {
      return data;
    }

    return JSON.stringify(data);
  }

  /**
   * Parses the response text as JSON if possible, otherwise returns raw text.
   *
   * @param {Response} response - The fetch response to parse.
   * @returns {Promise<any | string>} - The parsed JSON or raw text.
   */
  private async parseResponseText<T extends object>(
    response: Response
  ): Promise<T | string> {
    const text = await response.text();

    try {
      return text ? JSON.parse(text) : ({} as T);
    } catch {
      return text;
    }
  }

  /**
   * Makes a POST request to the specified endpoint
   * @param url - The endpoint URL
   * @param options - Request options including headers, data, etc.
   * @returns Promise resolving to the JSON response
   */
  post<T>(url: string, options: RequestOptions = {}): Promise<T> {
    return this.makeRequest<T>(url, { ...options, method: 'POST' });
  }

  /**
   * Makes a PUT request to the specified endpoint
   * @param url - The endpoint URL
   * @param options - Request options including headers, data, etc.
   * @returns Promise resolving to the JSON response
   */
  put<T>(url: string, options: RequestOptions = {}): Promise<T> {
    return this.makeRequest<T>(url, { ...options, method: 'PUT' });
  }

  /**
   * Makes a GET request to the specified endpoint
   * @param url - The endpoint URL
   * @param options - Request options including headers, namespace, etc.
   * @returns Promise resolving to the JSON response
   */
  request<T>(url: string, options: RequestOptions = {}): Promise<T> {
    return this.makeRequest<T>(url, { ...options, method: 'GET' });
  }

  /**
   * Makes a DELETE request to the specified endpoint
   * @param url - The endpoint URL
   * @param options - Request options including headers, etc.
   * @returns Promise resolving to the JSON response
   */
  delete<T>(url: string, options: RequestOptions = {}): Promise<T> {
    return this.makeRequest<T>(url, { ...options, method: 'DELETE' });
  }
}
