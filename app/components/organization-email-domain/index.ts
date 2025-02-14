import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';
import type OrganizationEmailDomainModel from 'irene/models/organization-email-domain';

export interface OrganizationEmailDomainSignature {
  Args: {
    isEditable?: boolean;
  };
}

export default class OrganizationEmailDomainComponent extends Component<OrganizationEmailDomainSignature> {
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;
  @service declare intl: IntlService;

  @tracked tDomain = '';
  @tracked domains: OrganizationEmailDomainModel[] = [];

  constructor(owner: unknown, args: OrganizationEmailDomainSignature['Args']) {
    super(owner, args);

    this.fetchDomains.perform();
  }

  get isDisableSave() {
    return isEmpty(this.tDomain.trim());
  }

  fetchDomains = task(async () => {
    this.domains = (
      await this.store.findAll('organization-email-domain')
    ).slice();
  });

  addDomain = task(async () => {
    const domainName = this.tDomain;

    const domainInfo = this.store.createRecord('organization-email-domain', {
      domainName,
    });

    try {
      await domainInfo.save();

      this.notify.success(`${domainName} ${this.intl.t('addedSuccessfully')}`);

      this.domains = [domainInfo, ...this.domains];

      this.tDomain = '';
    } catch (err) {
      domainInfo.rollbackAttributes();

      this.notify.error(parseError(err, domainName));
    }
  });

  deleteDomain = task(async (domain, index) => {
    try {
      this.domains = this.domains.filter((d) => d.id !== domain.id);

      await domain.deleteRecord();
      await domain.save();

      this.notify.success(this.intl.t('domainDeleted'));
    } catch (err) {
      // insert back on error
      this.domains.splice(index, 0, domain);
      this.domains = [...this.domains];

      this.notify.error(
        parseError(err, this.intl.t('problemWhileDeletingDomain'))
      );
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    OrganizationEmailDomain: typeof OrganizationEmailDomainComponent;
  }
}
