import Model, { attr, belongsTo, AsyncBelongsTo } from '@ember-data/model';
import { isEmpty } from '@ember/utils';
import SbomFileModel from './sbom-file';

export interface SbomComponentProperty {
  [key: string]: string;
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

  get isVulnerable() {
    return this.vulnerabilitiesCount > 0;
  }

  get isOutdated() {
    if (isEmpty(this.version) || isEmpty(this.latestVersion)) {
      return false;
    }

    return this.version !== this.latestVersion;
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'sbom-component': SbomComponentModel;
  }
}
