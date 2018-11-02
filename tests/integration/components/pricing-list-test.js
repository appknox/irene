import ENV from 'irene/config/environment';
import { test, moduleForComponent } from 'ember-qunit';
import { run } from '@ember/runloop';

moduleForComponent('pricing-list', 'Integration | Component | pricing list', {
  unit: true
});

test('tapping button fires an external action', function(assert) {

  var component = this.subject();
  var store = {
    createRecord: function() {
      return [
        {
          id: "devknox",
          name: "Devknox",
          description: "Dashboard Upload, Manual Scan",
          price: ENV.devknoxPrice,
          projectsLimit: 0,
        }
      ];
    }
  };
  component.set('store', store);

  run(function() {
    assert.deepEqual(component.get('durations'),
      [{"key": "MONTHLY","value": 1},{"key": "QUARTERLY","value": 3},{"key": "HALFYEARLY","value": 6},{"key": "YEARLY","value": 10}],
    "Durations");
    assert.notOk(component.activateDuration());
    assert.notOk(component.didRender());
  });
});
