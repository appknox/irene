import DS from 'ember-data';
import { translationMacro as t } from 'ember-i18n';

export default DS.Model.extend({
  
  i18n: Ember.inject.service(),
  deviceType: DS.attr('number'),
  platformVersion: DS.attr('string'),

  tNoPreference: t("noPreference"),

  versionText: (function() {
    const platformVersion = this.get("platformVersion");
    const tNoPreference = this.get("tNoPreference");
    if (platformVersion === "0") {
      return tNoPreference;
    } else {
      return platformVersion;
    }
  }).property("platformVersion")

});
