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
  setShowAsvs(data) {
    const adapter = this.store.adapterFor(this.constructor.modelName);
    return adapter.setShowAsvs(this, data);
  },
  unsetShowAsvs(data) {
    const adapter = this.store.adapterFor(this.constructor.modelName);
    return adapter.unsetShowAsvs(this, data);
  },
  setShowCwe(data) {
    const adapter = this.store.adapterFor(this.constructor.modelName);
    return adapter.setShowCwe(this, data);
  },
  unsetShowCwe(data) {
    const adapter = this.store.adapterFor(this.constructor.modelName);
    return adapter.unsetShowCwe(this, data);
  },
  setShowMstg(data) {
    const adapter = this.store.adapterFor(this.constructor.modelName);
    return adapter.setShowMstg(this, data);
  },
  unsetShowMstg(data) {
    const adapter = this.store.adapterFor(this.constructor.modelName);
    return adapter.unsetShowMstg(this, data);
  },
});
