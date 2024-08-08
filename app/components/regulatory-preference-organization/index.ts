import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { waitForPromise } from '@ember/test-waiters';
import IntlService from 'ember-intl/services/intl';
import Store from '@ember-data/store';

import OrganizationPreferenceModel from 'irene/models/organization-preference';
import parseError from 'irene/utils/parse-error';

export default class RegulatoryPreferenceOrganizationComponent extends Component {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked orgPreference: OrganizationPreferenceModel | null = null;

  constructor(owner: unknown, args: object) {
    super(owner, args);

    this.fetchOrganizationPreference.perform();
  }

  get regulatoryPreferences() {
    return [
      {
        label: 'PCI-DSS',
        checked: Boolean(this.orgPreference?.reportPreference.show_pcidss),
        task: this.savePcidss,
        title: this.intl.t('pcidssExpansion'),
      },
      {
        label: 'HIPAA',
        checked: Boolean(this.orgPreference?.reportPreference.show_hipaa),
        task: this.saveHipaa,
        title: this.intl.t('hipaaExpansion'),
      },
      {
        label: 'GDPR',
        checked: Boolean(this.orgPreference?.reportPreference.show_gdpr),
        task: this.saveGdpr,
        title: this.intl.t('gdprExpansion'),
      },
      {
        label: 'NIST',
        checked: Boolean(this.orgPreference?.reportPreference?.show_nist),
        task: this.saveNist,
        title: this.intl.t('nistExpansion'),
      },
      {
        label: 'SAMA',
        checked: Boolean(this.orgPreference?.reportPreference?.show_sama),
        task: this.saveSama,
        title: this.intl.t('samaExpansion'),
      },
    ];
  }

  fetchOrganizationPreference = task(async () => {
    try {
      this.orgPreference = await this.store.queryRecord(
        'organization-preference',
        {}
      );
    } catch (err) {
      this.orgPreference = null;

      return;
    }
  });

  savePcidss = task(async (event) => {
    await this.saveReportPreference.perform('show_pcidss', event);
  });

  saveHipaa = task(async (event) => {
    await this.saveReportPreference.perform('show_hipaa', event);
  });

  saveGdpr = task(async (event) => {
    await this.saveReportPreference.perform('show_gdpr', event);
  });

  saveNist = task(async (event) => {
    await this.saveReportPreference.perform('show_nist', event);
  });

  saveSama = task(async (event) => {
    await this.saveReportPreference.perform('show_sama', event);
  });

  saveReportPreference = task(
    async (
      regulator:
        | 'show_pcidss'
        | 'show_hipaa'
        | 'show_gdpr'
        | 'show_nist'
        | 'show_sama',
      event
    ) => {
      const preference = this.orgPreference as OrganizationPreferenceModel;
      try {
        preference.reportPreference[regulator] = event.target.checked;

        await waitForPromise(preference.save());
      } catch (err) {
        this.notify.error(parseError(err));
        event.target.checked = !event.target.checked;
      }
    }
  );
}
