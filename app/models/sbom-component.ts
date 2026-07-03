import { inject as service } from '@ember/service';
import Model, { attr, belongsTo, AsyncBelongsTo } from '@ember-data/model';
import IntlService from 'ember-intl/services/intl';
import SbomFileModel from './sbom-file';
import { ENUMS_DISPLAY } from 'irene/enums';

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
  declare aiArtifactClass: string;

  @attr('string')
  declare aiModelName: string;

  @attr('string')
  declare aiModelCategory: string;

  @attr('string')
  declare aiModelIdentificationConfidence: string;

  // Set only for artifact_class=library, from the AI library registry match
  // (e.g. "TensorFlow Lite") — a different pipeline than aiModelName, which
  // only ever comes from inference against a bundled file's own bytes.
  @attr('string')
  declare aiFrameworkName: string;

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

  get aiDisplayLabelKey() {
    if (!this.aiArtifactClass) return null;
    const classMap: Record<string, string> = {
      model: 'sbomModule.aiLabel.model',
      library: 'sbomModule.aiLabel.library',
      tokenizer: 'sbomModule.aiLabel.tokenizer',
      config: 'sbomModule.aiLabel.config',
      supporting: 'sbomModule.aiLabel.supporting',
      secret: 'sbomModule.aiLabel.secret',
      cloud_endpoint: 'sbomModule.aiLabel.cloudEndpoint',
    };
    return classMap[this.aiArtifactClass] || null;
  }

  /**
   * The specific identified model (e.g. "GPT-2"), distinct from the generic
   * role label ("Model"). Only ever set when model_family_inference actually
   * found a match in the file's own bytes — never derived from the filename.
   */
  get hasIdentifiedModelName() {
    return this.aiArtifactClass === 'model' && !!this.aiModelName;
  }

  /**
   * "Type" column for the AI-components-only view — deliberately different
   * wording from aiDisplayLabelKey (e.g. "Library" not "Inference Engine")
   * since that concept moves to aiPurpose in this view.
   */
  get aiTypeLabel() {
    if (!this.aiArtifactClass) return '-';
    const classMap: Record<string, string> = {
      model: 'sbomModule.aiTypeLabel.model',
      library: 'sbomModule.aiTypeLabel.library',
      tokenizer: 'sbomModule.aiTypeLabel.tokenizer',
      config: 'sbomModule.aiTypeLabel.config',
      supporting: 'sbomModule.aiTypeLabel.supporting',
      secret: 'sbomModule.aiTypeLabel.secret',
      cloud_endpoint: 'sbomModule.aiTypeLabel.cloudEndpoint',
    };
    const key = classMap[this.aiArtifactClass];
    return key ? this.intl.t(key) : '-';
  }

  /**
   * "Family" column for the AI-components-only view — the named AI
   * technology this artifact belongs to, from whichever pipeline actually
   * identified it. Never fabricated: empty for anything neither pipeline
   * could identify (e.g. tokenizer/config files, or a model file with no
   * recognizable tensor names/metadata).
   */
  get aiFamily() {
    return this.aiModelName || this.aiFrameworkName || '-';
  }

  /**
   * "Purpose" column for the AI-components-only view. Uses the specific
   * model_category when we identified one (e.g. "Text Generation"),
   * otherwise falls back to the generic role label this artifact class
   * always carries (e.g. "Inference Engine" for a library).
   */
  get aiPurpose() {
    if (this.aiModelCategory) return this.aiModelCategory;
    return this.aiDisplayLabelKey ? this.intl.t(this.aiDisplayLabelKey) : '-';
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'sbom-component': SbomComponentModel;
  }
}
