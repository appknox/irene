import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import moment from 'moment';
import dayjs from 'dayjs';
import { action } from '@ember/object';

export default class PartnerExportStatsComponent extends Component {
  @service store;

  @tracked dateRange = [moment().startOf('year'), moment()];

  maxDate = dayjs(Date.now());

  @action
  updateDateRange(d1, d2) {
    console.log(d1, d2);
  }
}
