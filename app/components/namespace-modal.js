/*
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 */
import Ember from 'ember';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-i18n';

const NamespaceModalComponent = Ember.Component.extend({

  i18n: Ember.inject.service(),
  showNamespaceModal: false,

  newNamespaceObserver: Ember.observer("realtime.namespace", function() {
    return this.set("showNamespaceModal", true);
  }),


  tRequestToAddNamespace: t("requestToAddNamespace"),
  tPleaseEnterAnyNamespace: t("pleaseEnterAnyNamespace"),

  actions: {
    addNamespace() {
      const tRequestToAddNamespace = this.get("tRequestToAddNamespace");
      const tPleaseEnterAnyNamespace = this.get("tPleaseEnterAnyNamespace");
      const namespace =  this.get("realtime.namespace");
      if (!namespace) {
        return this.get("notify").error(tPleaseEnterAnyNamespace, ENV.notifications);
      }
      const data =
        {namespace};
      const that = this;
      return this.get("ajax").post(ENV.endpoints.namespaceAdd, {data})
      .then(function() {
        that.get("notify").success(tRequestToAddNamespace);
        return that.set("showNamespaceModal", false);}).catch(function(error) {
        that.get("notify").error(error.payload.message);
        return (() => {
          const result = [];
          for (error of Array.from(error.errors)) {
            result.push(that.get("notify").error(error.detail != null ? error.detail.message : undefined));
          }
          return result;
        })();
      });
    }
  }
});

export default NamespaceModalComponent;
