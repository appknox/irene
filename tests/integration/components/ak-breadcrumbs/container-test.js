import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | ak-breadcrumbs/container', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function () {
    this.breadcrumbsService = this.owner.lookup('service:breadcrumbs');
  });

  test('it renders, registers, and unregisters a container', async function (assert) {
    this.breadcrumbsContainerId = 'breadcrumbsContainer_id';

    let breadcrumbsContainers = this.breadcrumbsService.containers;
    assert.strictEqual(
      breadcrumbsContainers.length,
      0,
      'Breadcrumbs container list is empty'
    );

    await render(
      hbs`<AkBreadcrumbs::Container @id={{this.breadcrumbsContainerId}} />`
    );

    breadcrumbsContainers = this.breadcrumbsService.containers;

    assert.strictEqual(
      breadcrumbsContainers.length,
      1,
      'Breadcrumbs container was registered'
    );

    const registeredContainer = breadcrumbsContainers.find(
      (container) => container.id === this.breadcrumbsContainerId
    );

    assert.ok(registeredContainer, 'Container was found in containers list.');

    await render(hbs``);

    breadcrumbsContainers = this.breadcrumbsService.containers;

    assert.strictEqual(
      breadcrumbsContainers.length,
      0,
      'Container was unregistered successfully.'
    );
  });

  test('it registers multiple containers', async function (assert) {
    this.breadcrumbsContainerId1 = 'breadcrumbsContainer_id_1';
    this.breadcrumbsContainerId2 = 'breadcrumbsContainer_id_2';

    let breadcrumbsContainers = this.breadcrumbsService.containers;
    assert.strictEqual(
      breadcrumbsContainers.length,
      0,
      'Breadcrumbs container list is empty'
    );

    await render(
      hbs`
        <AkBreadcrumbs::Container @id={{this.breadcrumbsContainerId1}} />
        <AkBreadcrumbs::Container @id={{this.breadcrumbsContainerId2}} />
      `
    );

    breadcrumbsContainers = this.breadcrumbsService.containers;

    assert.strictEqual(
      breadcrumbsContainers.length,
      2,
      'Breadcrumbs containers were registered.'
    );

    assert.strictEqual(
      breadcrumbsContainers[0].id,
      this.breadcrumbsContainerId1,
      `Container with id - ${this.breadcrumbsContainerId1} was registered.`
    );

    assert.strictEqual(
      breadcrumbsContainers[1].id,
      this.breadcrumbsContainerId2,
      `Container with id - ${this.breadcrumbsContainerId2} was registered.`
    );
  });
});
