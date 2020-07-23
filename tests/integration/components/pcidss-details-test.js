import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Integration | Component | pcidss details', function(hooks) {
  setupTest(hooks);

  test('tapping button fires an external action', function(assert) {
    var component = this.owner.factoryFor('component:pcidss-details').create();
    run(function() {
      component.send('showMoreDetails');
      assert.equal(component.get("readMoreDetails"), true, 'Read More Details');
      component.send('hideMoreDetails');
    });
  });
});
