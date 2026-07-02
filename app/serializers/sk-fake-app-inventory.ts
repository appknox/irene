import SkAppSerializer from './sk-app';

export default class SkFakeAppInventorySerializer extends SkAppSerializer {}

declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    'sk-fake-app-inventory': SkFakeAppInventorySerializer;
  }
}
