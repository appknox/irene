/**
 * Type definitions for ember-django-adapter
 * Django REST Framework adapter for Ember Data
 */

declare module 'ember-django-adapter/adapters/drf' {
  import RESTAdapter from '@ember-data/adapter/rest';
  import type { Snapshot } from '@ember-data/store/-private';
  import type Store from 'ember-data/store';
  import type ModelRegistry from 'ember-data/types/registries/model';

  /**
   * The Django REST Framework adapter allows your store to communicate
   * with Django REST Framework-built APIs by adjusting the JSON and URL
   * structure implemented by Ember Data to match that of DRF.
   */
  export default class DRFAdapter extends RESTAdapter {
    /**
     * The default serializer to use with this adapter
     */
    defaultSerializer: string;

    /**
     * Whether to add trailing slashes to URLs
     * @default true
     */
    addTrailingSlashes: boolean;

    /**
     * The key used for non-field errors in DRF responses
     * @default 'non_field_errors'
     */
    nonFieldErrorsKey: string;

    /**
     * Determine the pathname for a given type.
     *
     * @param type The model type name
     * @returns The pluralized, dasherized path
     */
    pathForType(type: keyof ModelRegistry): string;

    /**
     * Builds a URL for a given model name and optional ID.
     *
     * @param modelName The model name
     * @param id Single id or array of ids or query
     * @param snapshot Single snapshot or array of snapshots
     * @param requestType The type of request (e.g., 'findRecord', 'query')
     * @param query Object of query parameters to send for query requests
     * @returns The built URL
     */
    buildURL(
      modelName?: keyof ModelRegistry,
      id?:
        | string
        | string[]
        | number
        | number[]
        | Record<string, unknown>
        | null,
      snapshot?: Snapshot | Snapshot[] | null,
      requestType?: string,
      query?: Record<string, unknown>
    ): string;

    /**
     * Takes an ajax response, and returns the json payload or an error.
     *
     * @param status HTTP status code
     * @param headers Response headers
     * @param payload Response payload
     * @param requestData Optional request data
     * @returns The payload or an error
     */
    handleResponse(
      status: number,
      headers: object,
      payload: unknown,
      requestData?: unknown
    ): unknown;

    /**
     * Check if the response status indicates an invalid (400) error
     *
     * @param status HTTP status code
     * @returns True if status is 400
     */
    isInvalid(status: number): boolean;

    /**
     * Convert validation errors to a JSON API object.
     *
     * @param payload The error payload from DRF
     * @param keyPrefix Used to recursively process nested errors
     * @returns A list of JSON API compliant error objects
     * @private
     */
    _drfToJsonAPIValidationErrors(
      payload: Record<string, unknown>,
      keyPrefix?: string
    ): Array<{
      source: { pointer: string };
      detail: string;
      title: string;
    }>;

    /**
     * Map string values to arrays for consistent error handling
     *
     * @param payload The error payload
     * @returns The formatted payload
     * @private
     */
    _formatPayload(payload: Record<string, unknown>): Record<string, unknown>;

    /**
     * Strip the ID from a URL for findMany requests
     *
     * @param store The Ember Data store
     * @param snapshot The record snapshot
     * @returns The base URL without ID
     * @private
     */
    _stripIDFromURL(store: Store, snapshot: Snapshot): string;
  }
}

declare module 'ember-django-adapter/serializers/drf' {
  import RESTSerializer from '@ember-data/serializer/rest';
  import type Model from '@ember-data/model';

  /**
   * Handle JSON/REST (de)serialization for Django REST Framework APIs.
   *
   * This serializer adjusts payload data so that it is consumable by
   * Django REST Framework API endpoints.
   */
  export default class DRFSerializer extends RESTSerializer {
    /**
     * Indicates this uses the new serializer API
     */
    isNewSerializerAPI: boolean;

    /**
     * Returns the resource's relationships formatted as a JSON-API "relationships object".
     *
     * @param modelClass The model class
     * @param resourceHash The resource hash
     * @returns The relationships object
     */
    extractRelationships(
      modelClass: Model,
      resourceHash: Record<string, unknown>
    ): Record<string, unknown>;

    /**
     * Dasherizes the attribute keys in the JSON payload.
     *
     * @param hash The hash to normalize
     * @returns The normalized hash
     */
    normalize(
      modelClass: Model,
      resourceHash: Record<string, unknown>
    ): Record<string, unknown>;

    /**
     * Converts camelCase to underscored format for attributes.
     *
     * @param key The attribute key
     * @returns The underscored key
     */
    keyForAttribute(key: string): string;

    /**
     * Converts camelCase to underscored format for relationships.
     *
     * @param key The relationship key
     * @returns The underscored key
     */
    keyForRelationship(key: string): string;

    /**
     * Converts DRF API server responses into the format expected by the RESTSerializer.
     *
     * @param store The Ember Data store
     * @param primaryModelClass The primary model class
     * @param payload The payload from the DRF API
     * @param id The ID of the record
     * @param requestType The type of request
     * @returns The normalized payload
     */
    normalizeResponse(
      store: Store,
      primaryModelClass: Model,
      payload: object,
      id: string | number,
      requestType: string
    ): Record<string, unknown>;
  }
}

declare module 'ember-django-adapter' {
  export { default as DRFAdapter } from 'ember-django-adapter/adapters/drf';
  export { default as DRFSerializer } from 'ember-django-adapter/serializers/drf';
}
