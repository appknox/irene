import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | breadcrumbs', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(async function () {
    this.containerElement = document.createElement('ul');
    this.containerElement.id = 'breadcrumb_container';

    // First container
    this.container = {
      element: this.containerElement,
      id: 'breadcrumb_container',
    };

    this.service = this.owner.lookup('service:breadcrumbs');
  });

  test('it exists', function (assert) {
    assert.ok(this.service);
  });

  test('it registers a breadcrumb container', function (assert) {
    let breadcrumbsContainers = this.service.containers;
    assert.strictEqual(
      breadcrumbsContainers.length,
      0,
      'Breadcrumbs containers is empty.'
    );

    this.service.registerContainer(this.container);

    breadcrumbsContainers = this.service.containers;

    assert.strictEqual(
      breadcrumbsContainers.length,
      1,
      'New container was registered successfully.'
    );
  });

  test('it unregisters a breadcrumb container succesfully', function (assert) {
    // Creating a second container
    this.secondContainerElement = document.createElement('ul');
    this.secondContainerElement.id = 'second_breadcrumb_container';
    this.secondContainer = {
      element: this.secondContainerElement,
      id: 'second_breadcrumb_container',
    };

    let breadcrumbsContainers = this.service.containers;
    assert.strictEqual(
      breadcrumbsContainers.length,
      0,
      'Breadcrumbs containers is empty.'
    );

    this.service.registerContainer(this.container);
    this.service.registerContainer(this.secondContainer);

    breadcrumbsContainers = this.service.containers;

    assert.strictEqual(
      breadcrumbsContainers.length,
      2,
      'Two new container were registered successfully.'
    );

    this.service.unregisterContainer(this.container);

    breadcrumbsContainers = this.service.containers;

    assert.strictEqual(
      breadcrumbsContainers.length,
      1,
      'The first container was unregistered successfully.'
    );

    const firstContainer = breadcrumbsContainers.find(
      (container) => container.id === this.container.id
    );

    assert.notOk(
      firstContainer,
      'First container no longer exists in containers list.'
    );
  });

  test('it throws an error when re-registering an existing container', function (assert) {
    this.service.registerContainer(this.container);
    assert.throws(() => this.service.registerContainer(this.container));
  });

  test('it replaces an item correctly', function (assert) {
    this.service.registerContainer(this.container);

    // Create two items
    const firstBreadcrumbsItemElement = document.createElement('li');
    firstBreadcrumbsItemElement.id = 'first_item';
    const secondBreadcrumbsItemElement = document.createElement('li');
    secondBreadcrumbsItemElement.id = 'second_item';

    // Append items to container
    this.container.element.appendChild(firstBreadcrumbsItemElement);
    this.container.element.appendChild(secondBreadcrumbsItemElement);

    assert.strictEqual(
      this.container.element.childElementCount,
      2,
      'Added two items to breadcrumbs container successfully.'
    );

    // This will replace the previousSibling of this element if it exists.
    // In this case the list item with id of "first_item"
    const itemToReplace = {
      element: secondBreadcrumbsItemElement,
      id: 'second_item',
      replace: true,
    };

    this.service.replaceItem(itemToReplace);

    const containerChildren = [...this.container.element.children];

    const replacedItemIsNonExistent =
      this.container.element.childElementCount === 1 &&
      // This was because the first item would be replaced by the second item
      !containerChildren.some(
        (child) => child.id === firstBreadcrumbsItemElement.id
      );

    assert.true(
      replacedItemIsNonExistent,
      `Item with id - ${firstBreadcrumbsItemElement.id} was replaced successfully`
    );
  });
});
