import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Integration | Component | file overview', function(hooks) {
  setupTest(hooks);

  test('tapping button fires an external action', function(assert) {
    assert.expect(1);
    var component = this.owner.factoryFor('component:file-overview').create();
    assert.deepEqual(component.get('chartOptions'),{ "animation": { "animateRotate": false }, "legend": { "display": false }, "responsive": false }, "Chart Options");
  });
});
