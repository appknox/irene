import JSONAPISerializer from '@ember-data/serializer/json-api';

export default class PcidssSerializer extends JSONAPISerializer {}

declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    pcidss: PcidssSerializer;
  }
}
