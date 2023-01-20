import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';

export default class OrganizationArchiveListArchiveActionComponent extends Component {
  @service('notifications') notify;
  @service intl;

  tdownloadFailed = this.intl.t('organizationArchiveDownloadErrored');

  @task
  *downloadArchive() {
    const downloadURL = yield this.args.archive.downloadURL();

    if (downloadURL) {
      window.open(downloadURL);
      return;
    }

    this.notify.error(this.tdownloadFailed);
  }
}
