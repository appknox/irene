import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('analysis-overview', 'Integration | Component | analysis overview', {
  integration: true
});

test('it renders', function(assert) {

  this.render(hbs`{{analysis-overview}}`);

  assert.equal(this.$().text().trim(), '');
});
