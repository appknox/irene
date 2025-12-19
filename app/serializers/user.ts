import JSONAPISerializer from '@ember-data/serializer/json-api';

export default class UserSerializer extends JSONAPISerializer {}

declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    user: UserSerializer;
  }
}
