import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import { task } from 'ember-concurrency';
import Store from '@ember-data/store';

import parseError from 'irene/utils/parse-error';

import lookupValidator from 'ember-changeset-validations';
import { Changeset } from 'ember-changeset';
import { BufferedChangeset } from 'ember-changeset/types';
import { validateStoreDomain, validateStorePathname } from './validator';
import { validatePresence } from 'ember-changeset-validations/validators';

type ChangesetBufferProps = BufferedChangeset & {
  url: string;
};

const StoreUrlValidator = {
  url: [validatePresence(true), validateStoreDomain(), validateStorePathname()],
};

export default class UploadAppViaLinkComponent extends Component {
  @service declare store: Store;
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  @tracked showLinkUploadModal = false;
  @tracked changeset: ChangesetBufferProps | null = null;

  model = {};

  constructor(owner: unknown, args: object) {
    super(owner, args);

    this.changeset = Changeset(
      this.model,
      lookupValidator(StoreUrlValidator),
      StoreUrlValidator
    ) as ChangesetBufferProps;
  }

  @action
  openLinkUploadModal() {
    this.showLinkUploadModal = true;
  }

  @action
  closeLinkUploadModal() {
    this.showLinkUploadModal = false;
    this.changeset?.rollback?.();
  }

  uploadAppViaLink = task(async () => {
    await this.changeset?.validate?.();

    if (!this.changeset?.isValid) {
      return;
    }

    try {
      const uploadAppUrl = this.store.createRecord('uploadAppUrl', {
        url: this.changeset.url,
      });

      await uploadAppUrl.save();

      this.closeLinkUploadModal();
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'UploadApp::ViaLink': typeof UploadAppViaLinkComponent;
  }
}
