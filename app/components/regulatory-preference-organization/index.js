import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import parseError from 'irene/utils/parse-error';
import { waitForPromise } from '@ember/test-waiters';

export default class RegulatoryPreferenceOrganizationComponent extends Component {
  @service intl;
  @service store;
  @service('notifications') notify;
  @service organization;

  @tracked orgPreference;

  constructor() {
    super(...arguments);
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
        checked: Boolean(this.orgPreference?.reportPreference.show_nist),
        task: this.saveNist,
        title: this.intl.t('nistExpansion'),
      },
    ];
  }

  fetchOrganizationPreference = task(async () => {
    try {
      this.orgPreference = await waitForPromise(
        this.store.queryRecord('organization-preference', {})
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

  saveReportPreference = task(async (regulator, event) => {
    try {
      this.orgPreference.reportPreference[regulator] = event.target.checked;
      await waitForPromise(this.orgPreference.save());
    } catch (err) {
      this.notify.error(parseError(err));
      event.target.checked = !event.target.checked;
    }
  });
}
