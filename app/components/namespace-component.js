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

const NamespaceComponentComponent = Ember.Component.extend({

  namespace: "",
  added: false,
  classNames: ["column"],
  isAddingNamespace: false,
  showNamespaceModal: false,
  i18n: Ember.inject.service(),
  tRequestToAddNamespace: t("requestToAddNamespace"),
  tPleaseEnterAnyNamespace: t("pleaseEnterAnyNamespace"),

  notAdded: (function() {
    return !this.get("added");
  }).property("added"),

  actions: {
    
    addNamespace() {
      const tRequestToAddNamespace = this.get("tRequestToAddNamespace");
      const tPleaseEnterAnyNamespace = this.get("tPleaseEnterAnyNamespace");
      const namespace = this.get("namespace");
      if (!namespace) {
        return this.get("notify").error(tPleaseEnterAnyNamespace, ENV.notifications);
      }
      const data =
        {namespace};
      triggerAnalytics('feature',ENV.csb.namespaceAdded);
      const that = this;
      this.set("isAddingNamespace", true);
      return this.get("ajax").post(ENV.endpoints.namespaceAdd, {data})
      .then(function() {
        that.set("isAddingNamespace", false);
        that.set("namespace", "");
        that.get("notify").success(tRequestToAddNamespace);
        return that.set("showNamespaceModal", false);}).catch(function(error) {
        that.set("isAddingNamespace", false);
        that.get("notify").error(error.payload.message);
        return (() => {
          const result = [];
          for (error of Array.from(error.errors)) {
            result.push(that.get("notify").error(error.detail != null ? error.detail.message : undefined));
          }
          return result;
        })();
      });
    },

    toggleNamespaceModal() {
      return this.set("showNamespaceModal", !this.get("showNamespaceModal"));
    }
  }
});

export default NamespaceComponentComponent;
