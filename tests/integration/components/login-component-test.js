import { test, moduleForComponent } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('login-component', 'Integration | Component | login component', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(1);

  this.render(hbs("{{login-component}}"));

  assert.equal(this.$().text().trim(), 'Security fanatics at your service Member LoginForgot Password?Login');
});
