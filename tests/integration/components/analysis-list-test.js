import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | analysis list', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {

    await render(hbs`{{analysis-list}}`);

    assert.equal(this.$().text().trim(), 'Analysis ID	Vulnerability	RiskScan TypeStatus');
  });
});
