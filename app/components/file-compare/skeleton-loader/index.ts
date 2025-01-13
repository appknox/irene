import Component from '@glimmer/component';

export default class FileCompareSkeletonLoaderComponent extends Component {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileCompare::SkeletonLoader': typeof FileCompareSkeletonLoaderComponent;
  }
}
