import DRFSerializer from './drf';
import { EmbeddedRecordsMixin } from '@ember-data/serializer/rest';

export default DRFSerializer.extend(EmbeddedRecordsMixin, {
  attrs: {
    appMetadata: { embedded: 'always' },
    coreProject: { embedded: 'always' },
  },
});
