import DS from 'ember-data';

const UploadApp = DS.Model.extend({
  url: DS.attr('string'),
  fileKey: DS.attr('string'),
  fileKeySigned: DS.attr('string'),
});

export default UploadApp;
