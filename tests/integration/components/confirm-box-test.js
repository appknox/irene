import { test, moduleForComponent } from 'ember-qunit';
import { run } from '@ember/runloop';

moduleForComponent('confirm-box', 'Integration | Component | confirm box', {
  unit: true
});

test('tapping button fires an external action', function(assert) {
  assert.expect(1);

  var component = this.subject();

  run(function() {
    component.send('clearModal');
    assert.equal(component.get('isActive'),false, "Clear Modal");
  });
});
