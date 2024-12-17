import Component from '@glimmer/component';
import type SkAppVersionModel from 'irene/models/sk-app-version';

interface AppMonitoringVersionTableStoreVersionSignature {
  Args: {
    skAppVersion: SkAppVersionModel;
  };
}

export default class AppMonitoringVersionTableStoreVersionComponent extends Component<AppMonitoringVersionTableStoreVersionSignature> {}
