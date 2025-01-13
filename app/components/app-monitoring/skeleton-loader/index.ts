import Component from '@glimmer/component';

export default class AppMonitoringSkeletonLoaderComponent extends Component {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AppMonitoring::SkeletonLoader': typeof AppMonitoringSkeletonLoaderComponent;
  }
}
