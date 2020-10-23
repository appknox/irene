import Model, {
  attr
} from '@ember-data/model';
import {
  equal
} from '@ember/object/computed';
import {
  computed
} from '@ember/object';

export default class FileReportModel extends Model {

  @attr('date') generatedOn;

  @attr('string') language;

  @attr('string') format;

  @attr('number') progress;

  @attr() preferences;

  @attr('string') rating;

  @attr('number') fileId;

  @computed('progress')
  get isGenerating() {
    return this.progress >= 0 && this.progress <= 99;
  }

  @equal('progress', 100) isGenerated;

}
