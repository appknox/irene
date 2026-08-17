import Model, { attr, belongsTo, AsyncBelongsTo } from '@ember-data/model';
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

  @attr()
  declare evidence: SbomComponentEvidence;

  @attr()
  declare externalReferences: SbomComponentExternalReferences;

  /**
   * Server-side flag: GHSA published new vulnerability data for this
   * package after the file's last vulnerability scan. Re-scan recommended.
   * False when no SBComponentGlobalUpdate row exists, the vuln scan never
   * completed, or the global update timestamp <= scan's completed_at.
   */
  @attr('boolean')
  declare isStaleVulnData: boolean;

  /**
   * Server-side flag: Enola published a newer upstream version for this
   * package after the file's last composition scan. Re-scan recommended.
   * Same false-conditions as isStaleVulnData but for composition scans.
   */
  @attr('boolean')
  declare isStaleVersionData: boolean;

  get isVulnerable() {
    return this.vulnerabilitiesCount > 0;
  }

  get isStale() {
    return this.isStaleVulnData || this.isStaleVersionData;
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
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'sbom-component': SbomComponentModel;
  }
}
