import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  tagName: 'tr',

  chartOptions: computed(() =>
    ({
      legend: { display: false },
      animation: { animateRotate: false }
    })
  ),
});
