/* eslint-disable ember/no-classic-components, ember/no-classic-classes, ember/require-tagless-components, ember/no-actions-hash, ember/no-get, prettier/prettier */
import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  me: service('me'),
  intl: service(),

  actions: {
    openEditAnalysisModal() {
      const delegate = this.get("delegate");
      if (delegate && delegate.confirmCallback) {
        delegate.set("showEditAnalysisModal", true);
      }
    }
  }
});
