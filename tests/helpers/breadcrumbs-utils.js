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
