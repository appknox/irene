import Component from '@glimmer/component';
import dayjs from 'dayjs';
import { service } from '@ember/service';

import type LicenseModel from 'irene/models/license';
import type IntlService from 'ember-intl/services/intl';

export interface LicenseDetailSignature {
  Args: {
    license: LicenseModel;
  };
}

export default class LicenseDetailComponent extends Component<LicenseDetailSignature> {
  @service declare intl: IntlService;

  get license() {
    return this.args.license;
  }

  get startDate() {
    return dayjs(this.license?.startDate).format('DD MMM YYYY');
  }

  get expiryDate() {
    return dayjs(this.license?.expiryDate).format('DD MMM YYYY');
  }

  get featuresDetails() {
    if (this.license?.isLimitedScans) {
      return [
        {
          label: this.intl.t('noOfScans'),
          value: this.license?.perScanQuantity,
        },
        {
          label: this.intl.t('planType'),
          value: this.license?.perScanDescription,
        },
      ];
    }

    return [
      {
        label: this.intl.t('noOfApps'),
        value: this.license?.perAppQuantity,
      },
      {
        label: this.intl.t('planType'),
        value: this.license?.perAppDescription,
      },
    ];
  }

  get licenseSections() {
    return [
      {
        icon: 'shape-line' as const,
        title: this.intl.t('feature'),
        details: this.featuresDetails,
      },
      {
        icon: 'calendar-month' as const,
        title: this.intl.t('validity'),
        details: [
          { label: this.intl.t('startDate'), value: this.startDate },
          { label: this.intl.t('expiryDate'), value: this.expiryDate },
        ],
      },
      {
        icon: 'person' as const,
        title: this.intl.t('registration'),
        details: [
          {
            label: this.intl.t('licenseKey'),
            value: this.license?.key,
          },
          {
            label: this.intl.t('licensedTo'),
            value: `${this.license?.name} <${this.license?.email}>`,
          },
        ],
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    LicenseDetail: typeof LicenseDetailComponent;
  }
}
