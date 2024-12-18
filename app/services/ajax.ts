import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import fetch from 'fetch';
import ENV from 'irene/config/environment';

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
  const urlA = new URL(a);
  const urlB = new URL(b);

  return (
    urlA.protocol === urlB.protocol &&
    urlA.hostname === urlB.hostname &&
    urlA.port === urlB.port
  );
}

export default class IreneAjaxService extends Service {
  @service declare session: any;
  @tracked headers?: Record<string, string>;

  host: string = ENV.host;
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
    const { hostname } = new URL(url);

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

    // Only include headers if _shouldSendHeaders returns true
    const headers = this._shouldSendHeaders(finalUrl, options.host)
      ? {
          'Content-Type': 'application/json',
          ...this.defaultHeaders,
          ...options.headers,
        }
      : options.headers || {};

    const fetchOptions: RequestInit = {
      ...options,
      headers,
      body: options.data ? JSON.stringify(options.data) : undefined,
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
   * Parses the response text as JSON if possible, otherwise returns raw text.
   *
   * @param {Response} response - The fetch response to parse.
   * @returns {Promise<any | string>} - The parsed JSON or raw text.
   */
  private async parseResponseText<T>(response: Response): Promise<T | string> {
    const text = await response.text();

    try {
      return text ? JSON.parse(text) : {};
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
