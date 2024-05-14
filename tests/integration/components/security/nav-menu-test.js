import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Integration | Component | nav-menu', function (hooks) {
  setupRenderingTest(hooks);

  test('it shows all nav-menu options', async function (assert) {
    await render(hbs`<Security::NavMenu />`);

    assert.dom('[data-test-security-nav-menu]').exists();

    assert
      .dom('[data-test-security-nav-menu-item="projects"]')
      .exists()
      .hasText('Projects');

    assert
      .dom('[data-test-security-nav-menu-item="downloadapp"]')
      .exists()
      .hasText('Download App');

    assert
      .dom('[data-test-security-nav-menu-item="purgeanalysis"]')
      .exists()
      .hasText('Purge API Analyses');
  });
});
