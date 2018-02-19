import { test, moduleForComponent } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('analysis-details', 'Integration | Component | analysis details', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(1);

  this.render(hbs("{{analysis-details}}"));

  assert.equal(this.$().text().trim(), '');
});
