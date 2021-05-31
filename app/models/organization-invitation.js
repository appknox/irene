import Model, { attr, belongsTo }  from '@ember-data/model';

export default Model.extend({
  email: attr('string'),
  createdOn: attr('date'),
  updatedOn: attr('date'),
  team: belongsTo('organization-team'),
  organization: belongsTo('organization'),

  resend: function resend() {
    var adapter = this.store.adapterFor(this.constructor.modelName);
    return adapter.resend(this.store, this.constructor.modelName, this);
  }
});
