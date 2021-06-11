import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action, set } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class PartnerComponent extends Component {
  @service intl;
  @service router;
  @service organization;
  @service store;

  @tracked tabs = [
    {
      label: this.intl.t('clients'),
      active: true,
      enabled: true,
      link: 'authenticated.partner.clients',
    },
  ];

  @tracked partnerPlan = {};

  @action
  initalize() {
    this.setDefaultTab();
    this.fetchPartnerPlan.perform();
  }

  @action
  switchTab(tab) {
    this.tabs.map((tab) => {
      set(tab, 'active', false);
    });
    set(tab, 'active', true);
  }

  setDefaultTab() {
    const loadedTab = this.tabs.findBy('link', this.router.currentRouteName);
    if (loadedTab) {
      this.switchTab(loadedTab);
    }
  }

  @task(function* () {
    try {
      this.partnerPlan = yield this.store.queryRecord('partner/plan', {});
    } catch {
      return;
    }
  })
  fetchPartnerPlan;
}
