/* eslint-disable ember/no-computed-properties-in-native-classes, ember/no-mixins */
import { AsyncBelongsTo, attr, belongsTo } from '@ember-data/model';
import { isEmpty } from '@ember/utils';
import { ModelBaseMixin } from 'irene/mixins/base-model';

import ENUMS from 'irene/enums';
import type UserModel from 'irene/models/user';

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
  @belongsTo('user', { inverse: 'submissions', async: true })
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
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    submission: SubmissionModel;
  }
}
