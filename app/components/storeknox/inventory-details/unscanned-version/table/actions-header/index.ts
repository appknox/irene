import Component from '@glimmer/component';
import type SkAppVersionModel from 'irene/models/sk-app-version';

interface AppMonitoringVersionTableActionsSignature {
  Args: {
    skAppVersion: SkAppVersionModel;
  };
}

export default class AppMonitoringVersionTableActionsComponent extends Component<AppMonitoringVersionTableActionsSignature> {}
