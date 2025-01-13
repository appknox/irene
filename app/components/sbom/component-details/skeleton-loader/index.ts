import Component from '@glimmer/component';

export default class SbomComponentDetailsSkeletonLoaderComponent extends Component {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ComponentDetails::SkeletonLoader': typeof SbomComponentDetailsSkeletonLoaderComponent;
  }
}
