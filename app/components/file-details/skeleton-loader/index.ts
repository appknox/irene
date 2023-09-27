import Component from '@glimmer/component';

export default class FileDetailsSkeletonLoaderComponent extends Component {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::SkeletonLoader': typeof FileDetailsSkeletonLoaderComponent;
  }
}
