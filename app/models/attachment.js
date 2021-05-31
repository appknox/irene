import Model, { attr }  from '@ember-data/model';

const Attachment = Model.extend({
  uuid: attr('string'),
  name: attr('string'),
  downloadUrl: attr('string')
});

export default Attachment;
