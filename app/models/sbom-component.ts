import Model, { attr, belongsTo } from '@ember-data/model';
import { service } from '@ember/service';
import type { AsyncBelongsTo } from '@ember-data/model';
import type IntlService from 'ember-intl/services/intl';

import { ENUMS_DISPLAY } from 'irene/enums';
import type SbomFileModel from './sbom-file';

export interface SbomComponentProperty {
  [key: string]: string;
}

export interface SbomComponentEvidence {
  occurrences: {
    location: string[];
  };
}

export interface SbomComponentExternalReferences {
  website: string[];
}

type SbomArtifactClass =
  | 'model'
  | 'library'
  | 'tokenizer'
  | 'config'
  | 'supporting'
  | 'cloud_endpoint'
  | 'platform_managed_ai';

export default class SbomComponentModel extends Model {
  @service declare intl: IntlService;

  @belongsTo('sbom-file', { async: true, inverse: null })
  declare sbFile: AsyncBelongsTo<SbomFileModel>;

  @attr('string')
  declare name: string;

  @attr('string')
  declare type: string;

  @attr('string')
  declare author: string;

  @attr()
  declare licenses: string[];

  /**
   * Version of component or empty string if version not detected
   */
  @attr('string')
  declare version: string;

  /**
   * Latest version of component or empty string if version not detected
   */
  @attr('string')
  declare latestVersion: string;

  /**
   * Properties of component containes ecosystem can be an empty array
   */
  @attr()
  declare properties: SbomComponentProperty[];

  @attr('number')
  declare vulnerabilitiesCount: number;

  @attr('string')
  declare remediation: string;

  @attr('string')
  declare bomRef: string;

  @attr('number')
  declare dependencyCount: number;

  @attr('boolean')
  declare isDependency: boolean;

  @attr('boolean')
  declare isAiComponent: boolean;

  @attr('string')
  declare aiConfidence: string;

  @attr('string')
  declare aiArtifactClass: SbomArtifactClass;

  @attr('string')
  declare aiModelName: string;

  @attr('string')
  declare aiModelCategory: string;

  @attr('string')
  declare aiModelIdentificationConfidence: string;

  // Set for library artifacts from the AI library registry; unlike aiModelName, it comes from registry matching.
  @attr('string')
  declare aiFrameworkName: string;

  // Backend-authored purpose per artifact class, replacing the duplicated client-side aiRoleColumn fallback.
  @attr('string')
  declare aiPurpose: string;

  // Set for supporting artifacts uniquely linked to a bundled model; otherwise empty. This is bundle membership, not an SBOM dependency.
  @attr('string')
  declare aiAssociatedModelPath: string;

  @attr()
  declare evidence: SbomComponentEvidence;

  @attr()
  declare externalReferences: SbomComponentExternalReferences;

  get isVulnerable() {
    return this.vulnerabilitiesCount > 0;
  }

  get cleanVersion() {
    return this.version.trim().replace(/(^")|("$)/g, '');
  }

  get cleanLatestVersion() {
    return this.latestVersion.trim().replace(/(^")|("$)/g, '');
  }

  get evidenceLocations() {
    return this.evidence?.occurrences?.location?.length
      ? this.evidence.occurrences.location
      : ['-'];
  }

  get hasFoundLocations() {
    return (this.evidence?.occurrences?.location?.length ?? 0) > 0;
  }

  get externalReferenceLinks() {
    return this.externalReferences?.website?.length
      ? this.externalReferences.website
      : ['-'];
  }

  get primaryEvidenceLocation() {
    const locations = this.evidenceLocations;

    return locations.length > 0 ? locations[0] : null;
  }

  get primaryLink() {
    const links = this.externalReferenceLinks;

    return links.length > 0 ? links[0] : null;
  }

  get isMLModel() {
    return this.type === ENUMS_DISPLAY.SBOM_COMPONENT_TYPE_NAMES[3];
  }

  get isPlatformManagedAi() {
    return this.aiArtifactClass === 'platform_managed_ai';
  }

  get hasIdentifiedModelName() {
    return this.aiArtifactClass === 'model' && !!this.aiModelName;
  }

  get aiTypeLabel() {
    if (!this.aiArtifactClass) {
      return '-';
    }

    const classMap: Record<SbomArtifactClass, string> = {
      model: 'sbomModule.aiTypeLabel.model',
      library: 'sbomModule.aiTypeLabel.library',
      tokenizer: 'sbomModule.supportingArtifact',
      config: 'sbomModule.supportingArtifact',
      supporting: 'sbomModule.supportingArtifact',
      cloud_endpoint: 'sbomModule.aiTypeLabel.cloudEndpoint',
      platform_managed_ai: 'sbomModule.aiTypeLabel.platformManagedAi',
    };

    const key = classMap[this.aiArtifactClass];

    return key ? this.intl.t(key) : '-';
  }

  get aiFamily() {
    return this.aiModelName || this.aiFrameworkName || '-';
  }

  get aiPurposeFallback() {
    if (!this.aiArtifactClass) {
      return null;
    }

    const classMap: Record<SbomArtifactClass, string> = {
      model: 'sbomModule.aiPurposeFallback.model',
      library: 'sbomModule.aiPurposeFallback.library',
      tokenizer: 'sbomModule.aiPurposeFallback.tokenizer',
      config: 'sbomModule.aiPurposeFallback.config',
      supporting: 'sbomModule.aiPurposeFallback.supporting',
      cloud_endpoint: 'sbomModule.aiPurposeFallback.cloudEndpoint',
      platform_managed_ai: 'sbomModule.aiPurposeFallback.platformManagedAi',
    };

    const key = classMap[this.aiArtifactClass];

    return key ? this.intl.t(key) : null;
  }

  get aiPurposeDisplay() {
    return (
      this.aiPurpose || this.aiModelCategory || this.aiPurposeFallback || null
    );
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'sbom-component': SbomComponentModel;
  }
}
