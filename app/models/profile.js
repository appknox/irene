import DS from 'ember-data';

export default DS.Model.extend({
  files: DS.hasMany('file', {inverse:'profile'}),
  showUnknownAnalysis: DS.attr('boolean'),
  reportPreference: DS.attr(),
  saveReportPreference(data) {
    const adapter = this.store.adapterFor(this.constructor.modelName);
    return adapter.saveReportPreference(this, data);
  }
});
