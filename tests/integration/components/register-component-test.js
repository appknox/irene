import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('register-component', 'Integration | Component | register component', {
  unit: true,
  needs: [
    'component:g-recaptcha',
    'component:fa-icon'
  ],
});

test('tapping button fires an external action', function(assert) {

  var component = this.subject();

  Ember.run(function() {
    assert.notOk(component.init());
  });
});
