import DRFSerializer from './drf';
import DS from 'ember-data';

export default DRFSerializer.extend(DS.EmbeddedRecordsMixin, {
  attrs: {
    vulnerability: { embedded: 'always' },
    attachments: { embedded: 'always' }
  }
});
