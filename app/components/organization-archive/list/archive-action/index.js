import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';

export default class OrganizationArchiveListArchiveActionComponent extends Component {
  @service('notifications') notify;
  @service intl;

  tdownloadFailed = this.intl.t('organizationArchiveDownloadErrored');

  downloadArchive = task(async () => {
    const downloadURL = await this.args.archive.downloadURL();

    if (downloadURL) {
      window.open(downloadURL);
      return;
    }

    this.notify.error(this.tdownloadFailed);
  });
}
