/* eslint-disable ember/no-computed-properties-in-native-classes, ember/no-mixins */
import { AsyncBelongsTo, attr, belongsTo } from '@ember-data/model';
import { ModelBaseMixin } from 'irene/mixins/base-model';
import { isEmpty } from '@ember/utils';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import UserModel from './user';

export interface SubmissionAppData {
  name: string;
  package_name: string;
  icon_url: string;
  platform: number;
}

export const submissionStatusProgressPercentage = {
  [ENUMS.SUBMISSION_STATUS.STORE_VALIDATING_URL]: 20,
  [ENUMS.SUBMISSION_STATUS.STORE_DOWNLOAD_PREPARE]: 30,
  [ENUMS.SUBMISSION_STATUS.STORE_DOWNLOADING]: 40,
  [ENUMS.SUBMISSION_STATUS.STORE_UPLOAD_PREPARE]: 50,
  [ENUMS.SUBMISSION_STATUS.STORE_UPLOADING]: 60,
  [ENUMS.SUBMISSION_STATUS.VALIDATE_PREPARE]: 70,
  [ENUMS.SUBMISSION_STATUS.VALIDATING]: 80,
};

export default class SubmissionModel extends ModelBaseMixin {
  @service declare intl: IntlService;

  @belongsTo('user', { inverse: 'submissions' })
  declare user: AsyncBelongsTo<UserModel>;

  @attr('string')
  declare metaData: string;

  @attr('number')
  declare status: number;

  @attr('string')
  declare reason: string;

  @attr('number')
  declare source: number;

  @attr('string')
  declare packageName: string;

  @attr('string')
  declare statusHumanized: string;

  @attr()
  declare appData?: SubmissionAppData;

  @attr('string')
  declare url?: string;

  @attr('date')
  declare createdOn: Date;

  get isAndroid() {
    return this.appData?.platform === ENUMS.PLATFORM.ANDROID;
  }

  get isIos() {
    return this.appData?.platform === ENUMS.PLATFORM.IOS;
  }

  get viaLink() {
    return !isEmpty(this.url);
  }

  get progress() {
    return submissionStatusProgressPercentage[this.status];
  }

  get hasReason() {
    return (this.reason != null ? this.reason.length : 0) > 0;
  }

  get submissionStatus() {
    const status = this.status;

    switch (status) {
      case ENUMS.SUBMISSION_STATUS.DOWNLOAD_FAILED:
      case ENUMS.SUBMISSION_STATUS.VALIDATE_FAILED:
      case ENUMS.SUBMISSION_STATUS.STORE_URL_VALIDATION_FAILED:
      case ENUMS.SUBMISSION_STATUS.STORE_DOWNLOAD_FAILED:
      case ENUMS.SUBMISSION_STATUS.STORE_UPLOAD_FAILED:
        return {
          label: this.intl.t('failed'),
          icon: 'error',
          iconColor: 'error' as const,
          running: false,
          failed: true,
        };

      case ENUMS.SUBMISSION_STATUS.ANALYZING:
        return {
          label: this.intl.t('completed'),
          icon: 'download-done',
          iconColor: 'success' as const,
          running: false,
          failed: false,
        };

      default:
        return {
          label: this.intl.t('inProgress'),
          icon: 'downloading',
          iconColor: 'info' as const,
          running: true,
          failed: false,
        };
    }
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    submission: SubmissionModel;
  }
}
