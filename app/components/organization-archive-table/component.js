import Component from '@ember/component';
import { task } from 'ember-concurrency';
import { t } from 'ember-intl';
import { inject as service } from '@ember/service';

export default Component.extend({
  tagName: '',
  notify: service('notification-messages-service'),
  tdownloadFailed: t('organizationArchiveDownloadErrored'),

  downloadArchive: task(function * () {
    const downloadURL = yield this.get('archive').downloadURL();

    if(downloadURL){
      window.open(downloadURL);
      return;
    }
    this.get('notify').error(this.get('tdownloadFailed'));

  }).evented()

});
