import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import DS from 'ember-data';
import { translationMacro as t } from 'ember-i18n';

export default DS.Model.extend({

  i18n: service(),
  deviceType: DS.attr('number'),
  platformVersion: DS.attr('string'),

  tAnyVersion: t("anyVersion"),

  versionText: computed("platformVersion", function() {
    const platformVersion = this.get("platformVersion");
    const tAnyVersion = this.get("tAnyVersion");
    if (platformVersion === "0") {
      return tAnyVersion;
    } else {
      return platformVersion;
    }
  }),

  isAnyVersion: computed("platformVersion", function() {
    const platformVersion = this.get("platformVersion");
    return platformVersion !== "0";
  }),

});
