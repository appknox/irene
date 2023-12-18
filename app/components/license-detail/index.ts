import Component from '@glimmer/component';
import dayjs from 'dayjs';
import LicenseModel from 'irene/models/license';

export interface LicenseDetailSignature {
  Args: {
    license: LicenseModel;
  };
}

export default class LicenseDetailComponent extends Component<LicenseDetailSignature> {
  get startDate() {
    return dayjs(this.args.license.startDate).format('DD MMM YYYY');
  }

  get expiryDate() {
    return dayjs(this.args.license.expiryDate).format('DD MMM YYYY');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    LicenseDetail: typeof LicenseDetailComponent;
  }
}
