import { test, moduleForComponent } from 'ember-qunit';
import { run } from '@ember/runloop';

moduleForComponent('modal-card', 'Integration | Component | modal card', {
  unit: true
});

test('tapping button fires an external action', function(assert) {

  var component = this.subject();
  run(function() {
    component.send('clearModal');
    assert.equal(component.get('isActive'),false, "Active/False");
  });
});
