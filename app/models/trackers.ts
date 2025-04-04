import Model, { attr } from '@ember-data/model';

export interface FindingsData {
  code_signature: string[];
  network_signature: string[];
}

export default class TrackersModel extends Model {
  @attr('string')
  declare name: string;

  @attr()
  declare findings: FindingsData;

  @attr()
  declare categories: string[];

  @attr('date')
  declare createdAt: Date;

  @attr('date')
  declare updatedAt: Date;

  get codeSignature() {
    return this.findings?.code_signature || [];
  }

  get networkSignature() {
    return this.findings?.network_signature || [];
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    trackers: TrackersModel;
  }
}
