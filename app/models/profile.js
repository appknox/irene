import Model, { attr, hasMany }  from '@ember-data/model';

export default Model.extend({
  files: hasMany('file', {inverse:'profile'}),
  showUnknownAnalysis: attr('boolean'),
  reportPreference: attr(),

  saveReportPreference(data) {
    const adapter = this.store.adapterFor(this.constructor.modelName);
    return adapter.saveReportPreference(this, data);
  },
  setShowPcidss(data) {
    const adapter = this.store.adapterFor(this.constructor.modelName);
    return adapter.setShowPcidss(this, data);
  },
  unsetShowPcidss(data) {
    const adapter = this.store.adapterFor(this.constructor.modelName);
    return adapter.unsetShowPcidss(this, data);
  },
  setShowHipaa(data) {
    const adapter = this.store.adapterFor(this.constructor.modelName);
    return adapter.setShowHipaa(this, data);
  },
  unsetShowHipaa(data) {
    const adapter = this.store.adapterFor(this.constructor.modelName);
    return adapter.unsetShowHipaa(this, data);
  },
});
