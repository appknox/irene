import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | purge api analysis', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {

    await render(hbs`{{purge-api-analysis}}`);

    assert.equal(this.$().text().trim(), 'Purge API AnalysesPlease enter the id of the file you want to purge off API AnalysesSUBMIT');
  });
});
