import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Modifier | breadcrumbs-container', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function () {
    this.breadcrumbsService = this.owner.lookup('service:breadcrumbs');
  });

  test('it registers/unregisters a breadcrumbs container successfully ', async function (assert) {
    await render(hbs`<ul {{breadcrumbs-container id="container_id" }}></ul>`);

    let breadcrumbsContainers = this.breadcrumbsService.containers;

    assert.strictEqual(
      breadcrumbsContainers.length,
      1,
      'New container was registered successfully.'
    );

    assert.strictEqual(
      breadcrumbsContainers[0].id,
      'container_id',
      'Container was found in container list'
    );

    await render(hbs``);

    breadcrumbsContainers = this.breadcrumbsService.containers;

    assert.strictEqual(
      breadcrumbsContainers.length,
      0,
      'Container was unregistered successfully.'
    );
  });
});
