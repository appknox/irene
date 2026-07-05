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

  /**
   * True only when this component carries real file-location evidence
   * (models, cloud endpoints, and secrets all set this from the scanner
   * side — see ComponentEvidence.occurrences in enola). Named "found",
   * not "used": static scanning only proves where the pattern/file was
   * detected, not where it's actually invoked from at runtime. Distinct
   * from checking evidenceLocations directly since that getter always
   * returns a non-empty array (falling back to ['-']) to keep templates
   * simple.
   */
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
      platform_managed_ai: 'sbomModule.aiLabel.platformManagedAi',
    };
    return classMap[this.aiArtifactClass] || null;
  }

  get isPlatformManagedAi() {
    return this.aiArtifactClass === 'platform_managed_ai';
  }

  /**
   * The specific identified model (e.g. "GPT-2"), distinct from the generic
   * role label ("Model"). Only ever set when model_family_inference actually
   * found a match in the file's own bytes — never derived from the filename.
   */
  get hasIdentifiedModelName() {
    return this.aiArtifactClass === 'model' && !!this.aiModelName;
  }

  get confidenceLabel() {
    if (this.aiConfidence === 'high') return 'High';
    if (this.aiConfidence === 'medium') return 'Medium';
    if (this.aiConfidence === 'low') return 'Low';
    return null;
  }

  get confidenceColor() {
    if (this.aiConfidence === 'high') return 'success';
    if (this.aiConfidence === 'medium') return 'warn';
    return 'default';
  }

  /**
   * Explains WHY this artifact got the confidence it did — e.g. a tokenizer
   * filename alone is a weak signal, but gets raised to "high" once a real
   * model is found elsewhere in the same app. Deterministic from
   * (artifactClass, confidence): model/library/secret only ever reach a
   * baseline of "high" directly; tokenizer/config/supporting only ever reach
   * "medium"/"high" via the confidence-uplift pass (see
   * apply_confidence_uplift in ml_model_scanner.py), never as a baseline —
   * so the pair alone tells us which explanation applies, with no need for
   * the backend to separately track "was this uplifted".
   */
  get confidenceExplanationKey() {
    if (!this.aiArtifactClass || !this.aiConfidence) return null;

    const key = `${this.aiArtifactClass}:${this.aiConfidence}`;
    const explanationMap: Record<string, string> = {
      'model:high': 'sbomModule.confidenceExplanation.formatProof',
      'secret:high': 'sbomModule.confidenceExplanation.formatProof',
      'library:high': 'sbomModule.confidenceExplanation.libraryMatch',
      'cloud_endpoint:high': 'sbomModule.confidenceExplanation.cloudProviderMatch',
      'cloud_endpoint:medium': 'sbomModule.confidenceExplanation.cloudGenericMatch',
      'tokenizer:low': 'sbomModule.confidenceExplanation.genericLow',
      'config:low': 'sbomModule.confidenceExplanation.genericLow',
      'supporting:low': 'sbomModule.confidenceExplanation.genericLow',
      'tokenizer:medium': 'sbomModule.confidenceExplanation.tokenizerBaseline',
      'config:medium': 'sbomModule.confidenceExplanation.upliftedByLibrary',
      'supporting:medium': 'sbomModule.confidenceExplanation.upliftedByLibrary',
      'tokenizer:high': 'sbomModule.confidenceExplanation.upliftedByModel',
      'config:high': 'sbomModule.confidenceExplanation.upliftedByModel',
      'supporting:high': 'sbomModule.confidenceExplanation.upliftedByModel',
    };
    return explanationMap[key] || null;
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
      platform_managed_ai: 'sbomModule.aiTypeLabel.platformManagedAi',
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
