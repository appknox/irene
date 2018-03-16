import DS from 'ember-data';

const Attachment = DS.Model.extend({
  uuid: DS.attr('string'),
  name: DS.attr('string'),
  downloadUrl: DS.attr('string')
});

export default Attachment;
