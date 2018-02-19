import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('submission-details', 'Integration | Component | submission details', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(1);

  this.render(hbs("{{submission-details}}"));

  assert.equal(this.$().text().trim(), '');
});
