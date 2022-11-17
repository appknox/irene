/* eslint-disable ember/no-computed-properties-in-native-classes */
import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { sort } from '@ember/object/computed';
import ENUMS from 'irene/enums';

export default class SecurityFileModel extends Model {
  analysesSorting = ['risk:desc'];
  @sort('analyses', 'analysesSorting') sortedAnalyses;

  @attr('string') name;
  @attr('string') fileFormatDisplay;
  @belongsTo('user') user;
  @attr('number') apiScanStatus;
  @belongsTo('security/project') project;
  @hasMany('security/analysis') analyses;

  @attr('boolean') isDynamicDone;
  @attr('boolean') isStaticDone;
  @attr('number') manual;

  get isApiDone() {
    const apiScanStatus = this.apiScanStatus;
    if (apiScanStatus === ENUMS.SCAN_STATUS.COMPLETED) {
      return true;
    }

    return false;
  }
}
