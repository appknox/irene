import Model, { attr } from '@ember-data/model';
import { service } from '@ember/service';
import { capitalize } from '@ember/string';
import type IntlService from 'ember-intl/services/intl';

import { ENUMS_DISPLAY } from 'irene/enums';

/**
 * A unique SBOM component surfaced by the organization-level component
 * inventory search (`GET /api/v2/sb_components`). One record per unique
 * component version across the org's latest SBOM files.
 */
export default class SbomComponentInventoryModel extends Model {
  @service declare intl: IntlService;

  @attr('string')
  declare name: string;

  @attr('string')
  declare version: string;

  @attr('string')
  declare componentType: string;

  @attr('string')
  declare purlType: string;

  @attr('string')
  declare namespace: string;

  /** Canonical identifier from the backend, e.g. `maven::junit:junit`. */
  @attr('string')
  declare bomRef: string;

  /** Either "VULNERABLE" or "SECURE" as computed by the backend. */
  @attr('string')
  declare status: string;

  get hasVersion(): boolean {
    return Boolean(this.version && this.version.trim());
  }

  get displayVersion(): string {
    return this.hasVersion ? this.version : '-';
  }

  get isMLModel(): boolean {
    return this.componentType === ENUMS_DISPLAY.SBOM_COMPONENT_TYPE_NAMES[3];
  }

  get typeLabel(): string {
    if (!this.componentType) {
      return '-';
    }

    if (this.isMLModel) {
      return this.intl.t('sbomModule.mlModel');
    }

    return capitalize(this.componentType);
  }

  get isVulnerable(): boolean {
    return this.status === 'VULNERABLE';
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'sbom-component-inventory': SbomComponentInventoryModel;
  }
}
