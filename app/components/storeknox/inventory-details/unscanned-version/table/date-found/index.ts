import Component from '@glimmer/component';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import type SkAppVersionModel from 'irene/models/sk-app-version';

dayjs.extend(advancedFormat);

interface AppMonitoringVersionTableDateFoundSignature {
  Args: {
    skAppVersion: SkAppVersionModel;
  };
}

export default class AppMonitoringVersionTableDateFoundComponent extends Component<AppMonitoringVersionTableDateFoundSignature> {
  get dateFound() {
    return dayjs(this.args.skAppVersion.get('createdOn')).format('Do MMM YYYY');
  }
}
