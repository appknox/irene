import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import ENV from 'irene/config/environment';
import { t } from 'ember-intl';
import triggerAnalytics from 'irene/utils/trigger-analytics';

const isRegexFailed = function(url) {
  const reg = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9])$/;
  return reg.test(url);
};

const ApiFilterComponent = Component.extend({
  intl: service(),
  ajax: service(),
  notify: service('notifications'),

  newUrlFilter: null,
  deletedURL: "",

  tEmptyURL: t("emptyURLFilter"),
  tInvalidURL: t("invalidURL"),
  tUrlUpdated: t("urlUpdated"),
  isSavingFilter: false,
  isDeletingURLFilter: false,

  apiScanOptions: computed('profileId', 'store', function() {
    return this.get("store").queryRecord('api-scan-options', {id: this.get("profileId")});
  }),

  confirmCallback() {
    const apiUrlFilters = this.get("apiScanOptions.apiUrlFilters");
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
      const apiUrlFilters = this.get("apiScanOptions.apiUrlFilters");
      const newUrlFilter = this.get("newUrlFilter");
      if (isEmpty(newUrlFilter)) {
        return this.get("notify").error(tEmptyURL);
      }
      else {
        if (!isRegexFailed(newUrlFilter)) {
          return this.get("notify").error(`${newUrlFilter} ${tInvalidURL}`);
        }
      }
      if (!isEmpty(apiUrlFilters)) {
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
      const profileId = this.get("profileId");
      const url = [ENV.endpoints.profiles, profileId, ENV.endpoints.apiScanOptions].join('/');
      const data = {
        api_url_filters: updatedURLFilters
      };
      triggerAnalytics('feature', ENV.csb.addAPIEndpoints);
      this.set("isSavingFilter", true);
      this.get("ajax").put(url, {data})
      .then(() => {
        this.get("notify").success(tUrlUpdated);
        if(!this.isDestroyed) {
          this.send("closeRemoveURLConfirmBox");
          this.set("apiScanOptions.apiUrlFilters", updatedURLFilters);
          this.set("isSavingFilter", false);
          this.set("isDeletingURLFilter", false);
          this.set("newUrlFilter", "");
        }
      }, (error) => {
        if(!this.isDestroyed) {
          this.set("isSavingFilter", false);
          this.set("isDeletingURLFilter", false);
          this.get("notify").error(error.payload.message);
        }
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
