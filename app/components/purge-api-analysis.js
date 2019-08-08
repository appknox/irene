import Component from '@ember/component';
import { isEmpty } from '@ember/utils';
import { inject as service } from '@ember/service';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-i18n';

export default Component.extend({

  i18n: service(),
  tSuccessfullyPurgeAnalysis:t("successfullyPurgeAnalysis"),
  actions: {
    purgeAPIAnalyses() {
      const fileId = this.get("fileNumber");
      if (isEmpty(fileId)) {
        return this.get("notify").error("Please enter any File ID");
      }
      this.set("isPurgingAPIAnalyses", true);
      const url = [ENV.endpoints.files,fileId, ENV.endpoints.purgeAPIAnalyses].join('/');
      return this.get("ajax").post(url, { namespace: 'api/hudson-api'})
      .then(() => {
        this.set("isPurgingAPIAnalyses", false);
        this.get("notify").success(this.get('tSuccessfullyPurgeAnalysis'));
        this.set("fileNumber", "");
      }, (error) => {
        this.set("isPurgingAPIAnalyses", false);
        for (error of error.errors) {
          this.get("notify").error(error.detail.error);
        }
      });
    }
  }
});
