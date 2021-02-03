import Component from '@glimmer/component';
import {
  bb
} from 'billboard.js/dist/billboard.min.js';

import {
  computed,
  action
} from '@ember/object';

export default class ChartsAkDonutChartComponent extends Component {


  @computed('args.{title,subTitle}', function () {
    return `${this.args.title}\n${this.args.subTitle}`;
  })
  chartTitle;

  get chartData() {
    return this.args.data;
  }


  @action
  drawChart(element) {
    console.log('chartData', this.chartData)
    const data = this.chartData.map((data) => data);
    console.log('data', data)
    bb.generate({
      data: {
        columns: data,

        type: "donut", // for ESM specify as: donut()
        // onclick: function (d, i) {
        //   console.log("onclick", d, i);
        // },
        // onover: function (d, i) {
        //   console.log("onover", d, i);
        // },
        // onout: function (d, i) {
        //   console.log("onout", d, i);
        // }
      },
      donut: {
        title: this.chartTitle,
        label: {
          format: function (value) {
            return `${value}`;
          }
        }
      },
      bindto: element
    });
  }

}
