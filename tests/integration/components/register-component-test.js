import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('register-component', 'Integration | Component | register component', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });
  assert.ok(true);
  assert.equal(this.$().text().trim(), '');
});
