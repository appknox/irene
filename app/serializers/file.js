import DRFSerializer from './drf';
import { EmbeddedRecordsMixin } from '@ember-data/serializer/rest';

export default DRFSerializer.extend(EmbeddedRecordsMixin, {
  attrs: {
    analyses: { embedded: 'always' },
    tags: { embedded: 'always' },
  },
});
