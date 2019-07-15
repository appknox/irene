import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  i18n: service(),
  me: service('me'),
  classNames: ['column', 'is-one-sixth', 'content-right'],
  actions: {
    openEditAnalysisModal() {
      const delegate = this.get("delegate");
      if (delegate && delegate.confirmCallback) {
        delegate.set("showEditAnalysisModal", true);
      }
    }
  }
});
