import DS from 'ember-data';

export default DS.Model.extend({
  invoiceId: DS.attr('number'),
  createdOn: DS.attr('string'),

  downloadUrl(){
    // TODO: Write the logic to retrieve url from adapter
  }
});
