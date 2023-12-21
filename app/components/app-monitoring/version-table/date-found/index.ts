import Component from '@glimmer/component';
import AmAppVersionModel from 'irene/models/am-app-version';

import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';

dayjs.extend(advancedFormat);

interface AppMonitoringVersionTableDateFoundSignature {
  Args: {
    amAppVersion: AmAppVersionModel;
  };
}

export default class AppMonitoringVersionTableDateFoundComponent extends Component<AppMonitoringVersionTableDateFoundSignature> {
  get dateFound() {
    return dayjs(this.args.amAppVersion.get('createdOn')).format('Do MMM YYYY');
  }
}
