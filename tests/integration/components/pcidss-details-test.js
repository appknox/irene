import { test, moduleForComponent } from 'ember-qunit';
import { run } from '@ember/runloop';

moduleForComponent('pcidss-details', 'Integration | Component | pcidss details', {
  unit: true
});

test('tapping button fires an external action', function(assert) {
  var component = this.subject();
  run(function() {
    component.send('showMoreDetails');
    assert.equal(component.get("readMoreDetails"), true, 'Read More Details');
    component.send('hideMoreDetails');
  });
});
