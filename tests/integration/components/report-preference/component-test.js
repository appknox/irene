import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | report preference', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {

    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    await render(hbs`{{report-preference}}`);

    // assert.equal(this.$().text().trim(), '');

    // // Template block usage:
    // this.render(hbs`
    //   {{#report-preference}}
    //     template block text
    //   {{/report-preference}}
    // `);
    assert.equal(true, true)

  });
});
