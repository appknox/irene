import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { waitForPromise } from '@ember/test-waiters';
import type IntlService from 'ember-intl/services/intl';

import type OrganizationArchiveModel from 'irene/models/organization-archive';

export interface OrganizationArchiveListActionSignature {
  Args: {
    archive: OrganizationArchiveModel;
  };
}

export default class OrganizationArchiveListActionComponent extends Component<OrganizationArchiveListActionSignature> {
  @service('notifications') declare notify: NotificationService;
  @service declare intl: IntlService;
  @service('browser/window') declare window: Window;

  downloadArchive = task(async () => {
    const downloadURL = await waitForPromise(this.args.archive.downloadURL());

    if (downloadURL) {
      this.window.open(downloadURL);
      return;
    }

    this.notify.error(this.intl.t('organizationArchiveDownloadErrored'));
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OrganizationArchive::List::Action': typeof OrganizationArchiveListActionComponent;
    'organization-archive/list/action': typeof OrganizationArchiveListActionComponent;
  }
}
