import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('analysis-list', 'Integration | Component | analysis list', {
  integration: true
});

test('it renders', function(assert) {

  this.render(hbs`{{analysis-list}}`);

  assert.equal(this.$().text().trim(), 'Analysis ID	Vulnerability	RiskScan Type');
});
