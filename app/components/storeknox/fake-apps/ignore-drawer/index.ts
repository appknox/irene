import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import dayjs from 'dayjs';
import { task } from 'ember-concurrency';
import { waitForPromise } from '@ember/test-waiters';
import type IntlService from 'ember-intl/services/intl';

import { BufferedChangeset } from 'ember-changeset/types';
import { validatePresence } from 'ember-changeset-validations/validators';
import lookupValidator from 'ember-changeset-validations';
import { Changeset } from 'ember-changeset';

import parseError from 'irene/utils/parse-error';
import type SkFakeAppModel from 'irene/models/sk-fake-app';

type IgnoreDrawerChangeset = BufferedChangeset & { reason: string };

const ChangeValidator = {
  reason: [validatePresence(true)],
};

export interface StoreknoxFakeAppsIgnoreDrawerSignature {
  Args: {
    fakeApp: SkFakeAppModel;
    open: boolean;
    onClose: () => void;
    addToInventory?: boolean;
  };
}

export default class StoreknoxFakeAppsIgnoreDrawerComponent extends Component<StoreknoxFakeAppsIgnoreDrawerSignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  @tracked changeset: IgnoreDrawerChangeset | null = null;

  constructor(
    owner: unknown,
    args: StoreknoxFakeAppsIgnoreDrawerSignature['Args']
  ) {
    super(owner, args);
    this.changeset = Changeset(
      { reason: '' },
      lookupValidator(ChangeValidator),
      ChangeValidator
    ) as IgnoreDrawerChangeset;
  }

  get drawerTitle(): string {
    return this.isAlreadyIgnored
      ? this.intl.t('storeknox.ignoredDetails')
      : this.intl.t('confirmation');
  }

  get isAlreadyIgnored(): boolean {
    return Boolean(this.args.fakeApp?.reviewedBy);
  }

  get isAlreadyAddedToInventory(): boolean {
    return this.args.fakeApp?.isAddedToInventory;
  }

  get formattedIgnoredOn(): string {
    const reviewedOn = this.args.fakeApp?.reviewedOn;

    if (!reviewedOn) {
      return '';
    }

    return dayjs(reviewedOn).format('MMMM D, YYYY');
  }

  get ignoreDetails() {
    return [
      {
        label: this.isAlreadyAddedToInventory
          ? this.intl.t('storeknox.ignoredAndAddedToInventoryOn')
          : this.intl.t('storeknox.ignoredOn'),

        value: this.formattedIgnoredOn,
      },
      {
        label: this.isAlreadyAddedToInventory
          ? this.intl.t('storeknox.ignoredAndAddedToInventoryBy')
          : this.intl.t('storeknox.ignoredBy'),

        value: this.args.fakeApp?.reviewedBy,
      },
      {
        label: this.intl.t('reason'),
        value: this.args.fakeApp?.ignoreReason,
      },
    ];
  }

  @action
  updateReason(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    this.changeset?.set('reason', target?.value ?? '');
  }

  get isReasonValid(): boolean {
    return Boolean(this.changeset?.reason?.trim().length);
  }

  @action
  handleConfirmIgnore() {
    this.ignoreTask.perform();
  }

  @action
  handleClose() {
    this.changeset?.rollback();
    this.args.onClose();
  }

  ignoreTask = task(async () => {
    await this.changeset?.validate();

    if (this.changeset?.isInvalid) {
      return;
    }

    try {
      const reason = String(this.changeset?.reason);

      if (this.args.addToInventory) {
        await waitForPromise(this.args.fakeApp.ignoreAndAddToInventory(reason));
      } else {
        await waitForPromise(this.args.fakeApp.ignore(reason));
      }

      this.notify.success(
        this.args.addToInventory
          ? this.intl.t('storeknox.fakeAppIgnoredAndAddedToInventory')
          : this.intl.t('storeknox.fakeAppIgnored')
      );

      this.changeset?.rollback();
      this.args.onClose();
    } catch (error) {
      this.notify.error(parseError(error));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::FakeApps::IgnoreDrawer': typeof StoreknoxFakeAppsIgnoreDrawerComponent;
  }
}
