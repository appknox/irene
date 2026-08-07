import Model, { attr } from '@ember-data/model';
import { service } from '@ember/service';
import { capitalize } from '@ember/string';
import type IntlService from 'ember-intl/services/intl';

import ENUMS, { ENUMS_DISPLAY } from 'irene/enums';

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

  /** Latest known version of the component, or empty string if unknown. */
  @attr('string')
  declare latestVersion: string;

  /** Either "VULNERABLE" or "SECURE" as computed by the backend. */
  @attr('string')
  declare status: 'VULNERABLE' | 'SECURE';

  get hasVersion(): boolean {
    return Boolean(this.version && this.version.trim());
  }

  get displayVersion(): string {
    return this.hasVersion ? this.version : '-';
  }

  get cleanVersion(): string {
    return (this.version || '').trim().replace(/(^")|("$)/g, '');
  }

  get cleanLatestVersion(): string {
    return (this.latestVersion || '').trim().replace(/(^")|("$)/g, '');
  }

  get isMLModel(): boolean {
    return (
      this.componentType ===
      ENUMS_DISPLAY.SBOM_COMPONENT_TYPE_NAMES[
        ENUMS.SBOM_COMPONENT_TYPE.MACHINE_LEARNING_MODEL
      ]
    );
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
