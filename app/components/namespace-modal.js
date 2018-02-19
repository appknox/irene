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
      this.get("ajax").post(ENV.endpoints.namespaceAdd, {data})
      .then(function() {
        that.get("notify").success(tRequestToAddNamespace);
        that.set("showNamespaceModal", false);
      })
      .catch(function(error) {
        that.get("notify").error(error.payload.message);
      });
    }
  }
});

export default NamespaceModalComponent;
