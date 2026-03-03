import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import dayjs from 'dayjs';
import type IntlService from 'ember-intl/services/intl';

import { BufferedChangeset } from 'ember-changeset/types';
import { validatePresence } from 'ember-changeset-validations/validators';
import lookupValidator from 'ember-changeset-validations';
import { Changeset } from 'ember-changeset';

import type { StoreknoxFakeAppsDetailsModel } from 'irene/routes/authenticated/storeknox/fake-apps/details';

type IgnoreDrawerChangeset = BufferedChangeset & { reason: string };

const ChangeValidator = {
  reason: [validatePresence(true)],
};

export interface StoreknoxFakeAppsIgnoreDrawerSignature {
  Args: {
    fakeApp: StoreknoxFakeAppsDetailsModel;
    open: boolean;
    onClose: () => void;
  };
}

export default class StoreknoxFakeAppsIgnoreDrawerComponent extends Component<StoreknoxFakeAppsIgnoreDrawerSignature> {
  @service declare intl: IntlService;

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
    return Boolean(this.args.fakeApp?.reviewed_by);
  }

  get isAlreadyAddedToInventory(): boolean {
    return Boolean(this.args.fakeApp?.added_to_inventory_app);
  }

  get formattedIgnoredOn(): string {
    const reviewedOn = this.args.fakeApp?.reviewed_on;

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

        value: this.args.fakeApp?.reviewed_by,
      },
      {
        label: this.intl.t('reason'),
        value: this.args.fakeApp?.ignore_reason,
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
  async handleConfirmIgnore() {
    await this.changeset?.validate();

    if (this.changeset?.isInvalid) {
      return;
    }

    // Will be wired to API when coupled with fake app details
    this.changeset?.rollback();
    this.args.onClose();
  }

  @action
  handleClose() {
    this.changeset?.rollback();
    this.args.onClose();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::FakeApps::IgnoreDrawer': typeof StoreknoxFakeAppsIgnoreDrawerComponent;
  }
}
