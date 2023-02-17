import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Modifier | breadcrumbs-item', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function () {
    this.breadcrumbsService = this.owner.lookup('service:breadcrumbs');
  });

  test('it replaces an item correctly', async function (assert) {
    this.setProperties({
      firstItemId: 'item_id_1',
      secondItemId: 'item_id_2',
    });

    await render(hbs`
      <ul {{breadcrumbs-container id="container_id" }}></ul>

      {{#each this.breadcrumbsService.containers as |container|}}
        {{#in-element container.element insertBefore=null}}
          <li id={{this.firstItemId}} {{breadcrumbs-item id=this.firstItemId}} data-test-breadcrumb-item>
            Breadcrumb Item
          </li>
        {{/in-element}}
      {{/each}}

      {{#each this.breadcrumbsService.containers as |container|}}
        {{#in-element container.element insertBefore=null}}
          <li id={{this.secondItemId}} {{breadcrumbs-item id=this.secondItemId replace=true}} data-test-breadcrumb-item>
            Breadcrumb Item
          </li>
        {{/in-element}}
      {{/each}}
    
    `);

    const breadcrumbsContainers = this.breadcrumbsService.containers;

    assert.strictEqual(
      breadcrumbsContainers.length,
      1,
      'New container was registered successfully.'
    );

    const container = breadcrumbsContainers[0];

    assert.strictEqual(
      container.id,
      'container_id',
      'Container was found in container list'
    );

    const containerChildren = [...container.element.children];

    const replacedItemIsNonExistent =
      container.element.childElementCount === 1 &&
      // This was because the first item would be replaced by the second item
      !containerChildren.some((child) => child.id === this.firstItemId);

    assert.true(
      replacedItemIsNonExistent,
      `Item with id - ${this.firstItemId} was replaced successfully`
    );
  });
});
