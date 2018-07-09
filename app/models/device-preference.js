import Ember from 'ember';
import DS from 'ember-data';
import { translationMacro as t } from 'ember-i18n';

export default DS.Model.extend({

  i18n: Ember.inject.service(),
  deviceType: DS.attr('number'),
  platformVersion: DS.attr('string'),

  tAnyVersion: t("anyVersion"),

  versionText: (function() {
    const platformVersion = this.get("platformVersion");
    const tAnyVersion = this.get("tAnyVersion");
    if (platformVersion === "0") {
      this.set("isAnyDevice", true);
      return tAnyVersion;
    } else {
      return platformVersion;
    }
  }).property("platformVersion"),

  isAnyVersion: (function() {
    const platformVersion = this.get("platformVersion");
    return platformVersion !== "0";
  }).property("platformVersion")

});
