import Ember from 'ember';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-i18n';
import triggerAnalytics from 'irene/utils/trigger-analytics';

const isRegexFailed = function(url) {
  let res;
  const reg = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/;
  return res = reg.test(url);
};

const ApiFilterComponent = Ember.Component.extend({
  project: null,
  i18n: Ember.inject.service(),
  newUrlFilter: null,
  deletedURL: "",

  tEmptyURL: t("emptyURL"),
  tInvalidURL: t("invalidURL"),
  tUrlUpdated: t("urlUpdated"),
  isSavingFilter: false,
  isDeletingURLFilter: false,

  confirmCallback() {
    const apiUrlFilters = this.get("project.apiUrlFilters");
    const deletedURL = this.get("deletedURL");
    const splittedURLs = apiUrlFilters.split(",");
    const index = splittedURLs.indexOf(deletedURL);
    splittedURLs.splice(index,1);
    const joinedURLs = splittedURLs.join(",");
    this.set("updatedURLFilters", joinedURLs);
    this.set("isDeletingURLFilter", true);
    this.send("saveApiUrlFilter");
  },

  actions: {

    addApiUrlFilter() {
      let combinedURLS;
      const tInvalidURL = this.get("tInvalidURL");
      const tEmptyURL = this.get("tEmptyURL");
      const apiUrlFilters = this.get("project.apiUrlFilters");
      const newUrlFilter = this.get("newUrlFilter");
      if (Ember.isEmpty(newUrlFilter)) {
        return this.get("notify").error(tEmptyURL);
      }
      else {
        if (!isRegexFailed(newUrlFilter)) {
          return this.get("notify").error(`${newUrlFilter} ${tInvalidURL}`);
        }
      }
      if (!Ember.isEmpty(apiUrlFilters)) {
        combinedURLS = apiUrlFilters.concat("," , newUrlFilter);
      }
      else {
        combinedURLS = newUrlFilter;
      }
      this.set("updatedURLFilters", combinedURLS);
      this.send("saveApiUrlFilter");
    },

    saveApiUrlFilter() {
      const tUrlUpdated = this.get("tUrlUpdated");
      const updatedURLFilters = this.get("updatedURLFilters");
      const projectId = this.get("project.id");
      const apiScanOptions = [ENV.host,ENV.namespace, ENV.endpoints.apiScanOptions, projectId].join('/');
      const data =
        {apiUrlFilters: updatedURLFilters};
      triggerAnalytics('feature', ENV.csb.addAPIEndpoints);
      this.set("isSavingFilter", true);
      const that = this;
      this.get("ajax").post(apiScanOptions, {data})
      .then(function(){
        that.set("isSavingFilter", false);
        that.set("isDeletingURLFilter", false);
        that.get("notify").success(tUrlUpdated);
        that.set("project.apiUrlFilters", updatedURLFilters);
        that.set("newUrlFilter", "");
        that.send("closeRemoveURLConfirmBox");
      })
      .catch(function(error) {
        that.set("isSavingFilter", false);
        that.set("isDeletingURLFilter", false);
        that.get("notify").error(error.payload.message);
      });
    },

    openRemoveURLConfirmBox() {
      this.set("deletedURL", event.target.parentElement.parentElement.firstChild.textContent);
      this.set("showRemoveURLConfirmBox", true);
    },

    closeRemoveURLConfirmBox() {
      this.set("showRemoveURLConfirmBox", false);
    }
  }
});




export default ApiFilterComponent;
