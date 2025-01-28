import Component from '@glimmer/component';

export default class AppMonitoringDetailsSkeletonLoaderComponent extends Component {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AppMonitoring::Details::SkeletonLoader': typeof AppMonitoringDetailsSkeletonLoaderComponent;
  }
}
