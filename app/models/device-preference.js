import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import Model, { attr }  from '@ember-data/model';
import { t } from 'ember-intl';

export default Model.extend({

  intl: service(),
  deviceType: attr('number'),
  platformVersion: attr('string'),

  tAnyVersion: t("anyVersion"),

  versionText: computed('platformVersion', 'tAnyVersion', function() {
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
