import commondrf from './commondrf';

export default class SubmissionAdapter extends commondrf {}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    submission: SubmissionAdapter;
  }
}
