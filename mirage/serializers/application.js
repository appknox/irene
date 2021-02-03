import {
  JSONAPISerializer
} from 'ember-cli-mirage';



export default class ApplicationSerializer extends JSONAPISerializer {

  // serialize(payload, request) {
  //   // This is how to call super, as Mirage borrows [Backbone's implementation of extend](http://backbonejs.org/#Model-extend)
  //   let json = Serializer.prototype.serialize.apply(this, arguments);

  //   // Add metadata, sort parts of the response, etc.
  //   console.log('json', json)
  //   return json;

  // }

  // normalizeResponse(store, primaryModelClass, payload, id, requestType) {
  //   let convertedPayload = {};

  //   if (!isNone(payload) &&
  //     payload.hasOwnProperty('next') &&
  //     payload.hasOwnProperty('previous') &&
  //     payload.hasOwnProperty('results')) {

  //     // Move DRF metadata to the meta hash.
  //     convertedPayload[primaryModelClass.modelName] = JSON.parse(JSON.stringify(payload.results));
  //     delete payload.results;
  //     convertedPayload['meta'] = JSON.parse(JSON.stringify(payload));

  //     // The next and previous pagination URLs are parsed to make it easier to paginate data in applications.
  //     if (!isNone(convertedPayload.meta['next'])) {
  //       convertedPayload.meta['next'] = this.extractPageNumber(convertedPayload.meta['next']);
  //     }
  //     if (!isNone(convertedPayload.meta['previous'])) {
  //       let pageNumber = this.extractPageNumber(convertedPayload.meta['previous']);
  //       // The DRF previous URL doesn't always include the page=1 query param in the results for page 2. We need to
  //       // explicitly set previous to 1 when the previous URL is defined but the page is not set.
  //       if (isNone(pageNumber)) {
  //         pageNumber = 1;
  //       }
  //       convertedPayload.meta['previous'] = pageNumber;
  //     }
  //   } else {
  //     convertedPayload[primaryModelClass.modelName] = JSON.parse(JSON.stringify(payload));
  //   }

  //   // return single result for requestType 'queryRecord'
  //   let records = convertedPayload[primaryModelClass.modelName];
  //   if (requestType === 'queryRecord' && Array.isArray(records)) {
  //     let first = records.length > 0 ? records[0] : null;
  //     convertedPayload[primaryModelClass.modelName] = first;
  //   }

  //   return this.super(store, primaryModelClass, convertedPayload, id, requestType);
  // }
}
