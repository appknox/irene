import Component from '@glimmer/component';

export default class FileCompareCompareListSkeletonLoaderComponent extends Component {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileCompare::CompareList::SkeletonLoader': typeof FileCompareCompareListSkeletonLoaderComponent;
  }
}
