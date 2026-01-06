import DRFSerializer from 'ember-django-adapter/serializers/drf';

export default class UploadAppSerializer extends DRFSerializer {
  primaryKey = 'file_key';
}

declare module 'ember-data/types/registries/serializer' {
  export default interface SerializerRegistry {
    'upload-app': UploadAppSerializer;
  }
}
