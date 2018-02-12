/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
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
  tURLAdded: t("urlAdded"),
  isSavingFilter: false,

  confirmCallback() {
    const apiUrlFilters = this.get("project.apiUrlFilters");
    const deletedURL = this.get("deletedURL");
    const splittedURLs = apiUrlFilters.split(",");
    const index = splittedURLs.indexOf(deletedURL);
    splittedURLs.splice(index,1);
    const joinedURLs = splittedURLs.join(",");
    this.set("updatedURLFilters", joinedURLs);
    return this.send("saveApiUrlFilter");
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
      } else {
        if (!isRegexFailed(newUrlFilter)) { return this.get("notify").error(`${newUrlFilter} ${tInvalidURL}`); }
      }
      if (!Ember.isEmpty(apiUrlFilters)) {
        combinedURLS = apiUrlFilters.concat("," , newUrlFilter);
      } else {
        combinedURLS = newUrlFilter;
      }
      this.set("updatedURLFilters", combinedURLS);
      return this.send("saveApiUrlFilter");
    },

    saveApiUrlFilter() {
      const tURLAdded = this.get("tURLAdded");
      const updatedURLFilters = this.get("updatedURLFilters");
      const projectId = this.get("project.id");
      const apiScanOptions = [ENV.host,ENV.namespace, ENV.endpoints.apiScanOptions, projectId].join('/');
      const data =
        {apiUrlFilters: updatedURLFilters};
      triggerAnalytics('feature', ENV.csb.addAPIEndpoints);
      this.set("isSavingFilter", true);
      const that = this;
      return this.get("ajax").post(apiScanOptions, {data})
      .then(function(data){
        that.set("isSavingFilter", false);
        that.get("notify").success(tURLAdded);
        that.set("project.apiUrlFilters", updatedURLFilters);
        that.set("newUrlFilter", "");
        return that.send("closeRemoveURLConfirmBox");}).catch(function(error) {
        that.set("isSavingFilter", false);
        return (() => {
          const result = [];
          for (error of Array.from(error.errors)) {
            result.push(that.get("notify").error(error.detail != null ? error.detail.message : undefined));
          }
          return result;
        })();
      });
    },

    openRemoveURLConfirmBox() {
      this.set("deletedURL", event.target.parentElement.parentElement.firstChild.textContent);
      return this.set("showRemoveURLConfirmBox", true);
    },

    closeRemoveURLConfirmBox() {
      return this.set("showRemoveURLConfirmBox", false);
    }
  }
});




export default ApiFilterComponent;
