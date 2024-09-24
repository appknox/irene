import { module, test } from 'qunit';
import { setupRenderingTest } from 'irene/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module(
  'Integration | Component | storeknox/inventory/app-details',
  function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });

      await render(hbs`<Storeknox::InventoryDetails::AppDetails />`);

      assert.dom(this.element).hasText('');

      // Template block usage:
      await render(hbs`
      <Storeknox::InventoryDetails::AppDetails>
        template block text
      </Storeknox::InventoryDetails::AppDetails>
    `);

      assert.dom(this.element).hasText('template block text');
    });
  }
);
