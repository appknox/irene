/* eslint-disable ember/no-classic-components, ember/no-classic-classes, ember/require-tagless-components, ember/no-actions-hash, ember/no-get, prettier/prettier */
import Component from '@ember/component';
import { isEmpty } from '@ember/utils';
import ENV from 'irene/config/environment';

export default Component.extend({
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
        this.get("notify").success("Successfully Purged the Analysis");
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
