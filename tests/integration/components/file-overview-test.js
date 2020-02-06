import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('file-overview', 'Integration | Component | file overview', {
  unit: true
});

test('tapping button fires an external action', function(assert) {
  assert.expect(1);
  var component = this.subject();
  assert.deepEqual(component.get('chartOptions'),{ "animation": { "animateRotate": false }, "legend": { "display": false }, "responsive": false }, "Chart Options");
});
