import Component from '@glimmer/component';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import type SkAppVersionModel from 'irene/models/sk-app-version';

dayjs.extend(advancedFormat);

interface StoreknoxInventoryDetailsUnscannedVersionTableDateFoundSignature {
  Args: {
    skAppVersion: SkAppVersionModel;
  };
}

export default class StoreknoxInventoryDetailsUnscannedVersionTableDateFoundComponent extends Component<StoreknoxInventoryDetailsUnscannedVersionTableDateFoundSignature> {
  get dateFound() {
    return dayjs(this.args.skAppVersion.get('createdOn')).format('Do MMM YYYY');
  }
}
