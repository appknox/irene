import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | ak-breadcrumbs/container', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function () {
    this.breadcrumbsService = this.owner.lookup('service:breadcrumbs');
  });

  test('it renders and registers a modifiable container', async function (assert) {
    this.breadcrumbsContainerId = 'breadcrumbsContainer_id';
    let breadcrumbsContainer = this.breadcrumbsService.container;

    assert.strictEqual(
      breadcrumbsContainer,
      null,
      'No Breadcrumbs container is registered'
    );

    await render(
      hbs`<AkBreadcrumbs::Container @isModifiable={{true}} @id={{this.breadcrumbsContainerId}} />`
    );

    this.breadcrumbsService = this.owner.lookup('service:breadcrumbs');
    breadcrumbsContainer = this.breadcrumbsService.container;

    assert.dom('[data-test-ak-breadcrumbs-container]').exists();
    assert.ok(breadcrumbsContainer, 'Breadcrumbs container was registered');
    assert.strictEqual(breadcrumbsContainer.id, this.breadcrumbsContainerId);
  });
});
