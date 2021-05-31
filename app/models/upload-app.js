import Model, { attr }  from '@ember-data/model';

const UploadApp = Model.extend({
  url: attr('string'),
  fileKey: attr('string'),
  fileKeySigned: attr('string'),
});

export default UploadApp;
