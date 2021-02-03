import Component from '@glimmer/component';
import {
  bb
} from 'billboard.js/dist/billboard.min.js';
import {
  task
} from 'ember-concurrency';
import {
  inject as service
} from '@ember/service';
import {
  tracked
} from '@glimmer/tracking';

export default class ChartsClientCreditsComponent extends Component {

  @service store;

  @tracked creditsCompound = [];

  drawChart(element, chartData) {
    bb.generate({
      data: {
        columns: chartData,
        type: "pie", // for ESM specify as: pie()
        // onclick: function (d, i) {
        //   console.log("onclick", d, i);
        // },
        // onover: function (d, i) {
        //   console.log("onover", d, i);
        // },
        // onout: function (d, i) {
        //   console.log("onout", d, i);
        // },
        names: {
          available: "Available Scans",
          utilized: "Utilized Scans"
        }
      },
      pie: {
        label: {
          format: function (value) {
            return `${value} scans`;
          }
        }
      },
      color: {
        pattern: ["#006600", "#FE4D3F"]
      },
      bindto: element
    });

  }

  @task(function* (element) {
    const clientCompound = yield this.store.findAll('credits/client-compound');
    const x = ['available'];
    const y = ['utilized'];
    yield clientCompound.forEach(async (credit) => {
      x.push(credit.available);
      y.push(credit.utilized);
    })
    this.creditsCompound = [x, y];
    this.drawChart(element, this.creditsCompound);

  }) loadChartData;
}
