import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('purge-api-analysis', 'Integration | Component | purge api analysis', {
  integration: true
});

test('it renders', function(assert) {

  this.render(hbs`{{purge-api-analysis}}`);

  assert.equal(this.$().text().trim(), 'Purge API AnalysesPlease enter the id of the file you want to purge off API AnalysesSubmit');
});
