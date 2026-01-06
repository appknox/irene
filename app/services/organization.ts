import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type Store from '@ember-data/store';

import ENV from 'irene/config/environment';
import type OrganizationModel from 'irene/models/organization';
import type IreneAjaxService from './ajax';

export default class OrganizationService extends Service {
  @service declare store: Store;
  @service declare notifications: NotificationService;
  @service declare ajax: IreneAjaxService;

  @tracked selected: OrganizationModel | null = null;

  get orgFeatures() {
    return this.selected?.features;
  }

  get orgAiFeatures() {
    return this.selected?.aiFeatures;
  }

  get hideUpsellUI() {
    return this.selected?.hideUpsellFeatures;
  }

  get hideUpsellUIStatus() {
    return {
      privacyModule: !this.orgFeatures?.privacy && this.hideUpsellUI,
      sbom: !this.orgFeatures?.sbom && this.hideUpsellUI,
      aiReporting: !this.orgAiFeatures?.reporting && this.hideUpsellUI,
      aiPii: !this.orgAiFeatures?.pii && this.hideUpsellUI,

      dynamicScanAutomation:
        !this.orgFeatures?.dynamicscan_automation && this.hideUpsellUI,
    };
  }

  get selectedOrgProjectsCount() {
    if (this.selected) {
      return this.selected.projectsCount;
    }

    return 0;
  }

  get allSelectedOrgAiFeaturesDisabled() {
    const aiFeatures = this.selected?.aiFeatures;

    if (!aiFeatures) {
      return true;
    }

    return Object.keys(aiFeatures).every(
      (feature) => !aiFeatures[feature as keyof typeof aiFeatures]
    );
  }

  async fetchOrganization() {
    const organizations = await this.store.findAll('organization');
    const selectedOrg = organizations.slice()[0];

    if (selectedOrg) {
      this.selected = selectedOrg;
    } else {
      this.notifications.error(
        'Organization is missing Contact Support',
        ENV.notifications
      );
    }
  }

  async load() {
    await this.fetchOrganization();
  }
}
