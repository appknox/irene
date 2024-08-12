import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import { next } from '@ember/runloop';
import { waitForPromise } from '@ember/test-waiters';
import type { BufferedChangeset } from 'ember-changeset/types';
import type RouterService from '@ember/routing/router-service';
import type IntlService from 'ember-intl/services/intl';
import type Store from '@ember-data/store';

import type ServiceAccountModel from 'irene/models/service-account';
import type ServiceAccountService from 'irene/services/service-account';
import { ServiceAccountType } from 'irene/models/service-account';
import parseError from 'irene/utils/parse-error';

export interface ServiceAccountCreateSignature {
  Args: {
    duplicateServiceAccount: ServiceAccountModel | null;
  };
}

export default class ServiceAccountCreateComponent extends Component<ServiceAccountCreateSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service declare router: RouterService;
  @service('notifications') declare notify: NotificationService;

  @service('service-account')
  declare serviceAccountService: ServiceAccountService;

  @tracked serviceAccount: ServiceAccountModel;
  @tracked changeset: BufferedChangeset | null = null;

  constructor(owner: unknown, args: ServiceAccountCreateSignature['Args']) {
    super(owner, args);

    this.serviceAccount = this.initServiceAccount(
      this.args.duplicateServiceAccount
    );
  }

  willDestroy(): void {
    super.willDestroy();

    this.serviceAccountService.selectedProjectsForCreate = {};
  }

  get breadcrumbItems() {
    return [
      {
        route: 'authenticated.dashboard.organization.namespaces',
        linkTitle: this.intl.t('organization'),
      },
      {
        route: 'authenticated.dashboard.organization-settings',
        linkTitle: this.intl.t('settings'),
      },
      {
        route: 'authenticated.dashboard.organization-settings.service-account',
        linkTitle: this.intl.t('serviceAccount'),
      },
      {
        route: 'authenticated.dashboard.service-account-create',
        linkTitle: this.intl.t('create'),
      },
    ];
  }

  initServiceAccount(duplicateServiceAccount: ServiceAccountModel | null) {
    const noExpiry = duplicateServiceAccount?.expiry === null;

    return this.store.createRecord('service-account', {
      name: duplicateServiceAccount?.name ?? '',
      description: duplicateServiceAccount?.description ?? '',
      scopePublicApiUserRead:
        duplicateServiceAccount?.scopePublicApiUserRead ?? false,
      scopePublicApiProjectRead:
        duplicateServiceAccount?.scopePublicApiProjectRead ?? false,
      scopePublicApiScanResultVa:
        duplicateServiceAccount?.scopePublicApiScanResultVa ?? false,
      serviceAccountType: ServiceAccountType.USER,
      allProjects: duplicateServiceAccount?.allProjects ?? true,
      ...(noExpiry ? { expiry: null } : {}),
    });
  }

  createServiceAccount = task(async () => {
    await this.changeset?.validate();

    if (this.changeset?.isInvalid) {
      return;
    }

    try {
      const serviceAccount = await this.changeset?.save();

      this.serviceAccountService.tempSecretAccessKey =
        serviceAccount.secretAccessKey;

      if (!serviceAccount.allProjects) {
        for (const project of Object.values(
          this.serviceAccountService.selectedProjectsForCreate
        )) {
          await waitForPromise(serviceAccount.addProject(Number(project.id)));
        }
      }

      this.router.transitionTo(
        'authenticated.dashboard.service-account-details',
        serviceAccount.id
      );

      this.notify.success(this.intl.t('serviceAccountModule.createSuccessMsg'));
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });

  @action
  setChangeset(changeset: BufferedChangeset) {
    const mergedChangeset = this.changeset?.merge(changeset) || changeset;

    next(() => {
      this.changeset = mergedChangeset;
    });

    return mergedChangeset;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::ServiceAccount::Create': typeof ServiceAccountCreateComponent;
  }
}
