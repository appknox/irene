import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Integration | Component | post-production-scan', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {});

  test('Post production scan component renders', async function (assert) {
    const postProductionRoute = await this.owner.lookup(
      'route:authenticated/post-production-scan'
    );
    const routeModel = await postProductionRoute.model();
    this.set('routeModel', routeModel);

    await render(hbs`<PostProductionScan @model={{this.routeModel}} />`);
    assert
      .dom('[data-test-page-header-text]')
      .hasText('Welcome to the Post Production Scan');
  });
});
