import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { waitForPromise } from '@ember/test-waiters';
import type IntlService from 'ember-intl/services/intl';
import type Store from 'ember-data/store';

import type OrganizationPreferenceModel from 'irene/models/organization-preference';
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
        label: this.intl.t('pcidss'),
        checked: Boolean(this.orgPreference?.reportPreference.show_pcidss),
        task: this.savePcidss,
        title: this.intl.t('pcidssExpansion'),
      },
      {
        label: this.intl.t('hipaa'),
        checked: Boolean(this.orgPreference?.reportPreference.show_hipaa),
        task: this.saveHipaa,
        title: this.intl.t('hipaaExpansion'),
      },
      {
        label: this.intl.t('gdpr'),
        checked: Boolean(this.orgPreference?.reportPreference.show_gdpr),
        task: this.saveGdpr,
        title: this.intl.t('gdprExpansion'),
      },
      {
        label: this.intl.t('nist'),
        checked: Boolean(this.orgPreference?.reportPreference?.show_nist),
        task: this.saveNist,
        title: this.intl.t('nistExpansion'),
      },
      {
        label: this.intl.t('sama'),
        checked: Boolean(this.orgPreference?.reportPreference?.show_sama),
        task: this.saveSama,
        title: this.intl.t('samaExpansion'),
      },
      {
        label: this.intl.t('dora'),
        checked: Boolean(this.orgPreference?.reportPreference?.show_dora),
        task: this.saveDora,
        title: this.intl.t('doraExpansion'),
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

  saveDora = task(async (event) => {
    await this.saveReportPreference.perform('show_dora', event);
  });

  saveReportPreference = task(
    async (
      regulator:
        | 'show_pcidss'
        | 'show_hipaa'
        | 'show_gdpr'
        | 'show_nist'
        | 'show_sama'
        | 'show_dora',
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

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    RegulatoryPreferenceOrganization: typeof RegulatoryPreferenceOrganizationComponent;
  }
}
