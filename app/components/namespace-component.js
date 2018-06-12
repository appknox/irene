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
  ajax: Ember.inject.service(),
  notify: Ember.inject.service('notification-messages-service'),
  tRequestToAddNamespace: t("requestToAddNamespace"),
  tPleaseEnterAnyNamespace: t("pleaseEnterAnyNamespace"),

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
      this.set("isAddingNamespace", true);
      this.get("ajax").post(ENV.endpoints.namespaceAdd, {data})
      .then(() => {
        this.get("notify").success(tRequestToAddNamespace);
        if(!this.isDestroyed) {
          this.set("isAddingNamespace", false);
          this.set("namespace", "");
          this.set("showNamespaceModal", false);
        }
      }, (error) => {
        if(!this.isDestroyed) {
          this.set("isAddingNamespace", false);
          this.get("notify").error(error.payload.message);
        }
      });
    },

    toggleNamespaceModal() {
      this.set("showNamespaceModal", !this.get("showNamespaceModal"));
    }
  }
});

export default NamespaceComponentComponent;
