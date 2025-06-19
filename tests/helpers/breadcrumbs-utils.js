import { findAll, click } from '@ember/test-helpers';

export const doBreadcrumbItemsCompare = (
  serviceItems,
  expectedItems,
  assert,
  skipUICheck = false
) => {
  assert.strictEqual(serviceItems.length, expectedItems.length);

  serviceItems.forEach((it, idx) => {
    const expectedItem = expectedItems[idx];
    const expectedModels = (expectedItem?.models ?? []).join(':');
    const serviceModels = (it?.models ?? []).join(':');

    assert.strictEqual(
      expectedItem?.route,
      it?.route,
      `route match: ${expectedItem?.route} <> ${it?.route}`
    );

    assert.strictEqual(
      expectedItem.routeGroup,
      it?.routeGroup,
      `route group: ${expectedItem?.routeGroup} <> ${it?.routeGroup}`
    );

    assert.strictEqual(
      serviceModels,
      expectedModels,
      expectedModels || serviceModels
        ? `route models: ${serviceModels} <> ${expectedModels}`
        : ''
    );

    if (!skipUICheck) {
      assert
        .dom(`[data-test-ak-breadcrumbs-auto-trail-item-key="${it?.route}"]`)
        .exists();
    }
  });
};

export const assertBreadcrumbsUI = (expectedTexts, assert) => {
  const breadcrumbElements = findAll(
    '[data-test-ak-breadcrumbs-auto-trail-item]'
  );

  assert.strictEqual(
    breadcrumbElements.length,
    expectedTexts.length,
    `Expected ${expectedTexts.length} breadcrumb items, found ${breadcrumbElements.length}`
  );

  breadcrumbElements.forEach((el, index) => {
    const text = el.textContent.trim();

    assert.ok(
      text.includes(expectedTexts[index]),
      `Breadcrumb at index ${index} contains expected text "${expectedTexts[index]}")`
    );
  });
};

export const navigateBackWithBreadcrumb = async () => {
  const breadcrumbElements = findAll(
    '[data-test-ak-breadcrumbs-auto-trail-item]'
  );

  const index = breadcrumbElements.length - 2;

  await click(breadcrumbElements[index].querySelector('a'));
};
