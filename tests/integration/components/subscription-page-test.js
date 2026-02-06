import { find, findAll, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import dayjs from 'dayjs';

module('Integration | Component | subscription-page', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');

  hooks.beforeEach(async function () {
    this.server.createList('organization', 1);
    const store = this.owner.lookup('service:store');

    this.server.get('/organizations/:id/subscription-info', (schema, request) =>
      schema.subscriptionInfos.find(request.params.id)
    );

    this.store = store;
  });

  test('it renders subscription page with all details', async function (assert) {
    const subscriptionInfo = this.server.create('subscription-info');

    const subModel = this.store.push(
      this.store.normalize('subscription-info', subscriptionInfo.toJSON())
    );

    this.set('subscriptionInfo', subModel);

    await render(
      hbs`<SubscriptionPage @subscriptionInfo={{this.subscriptionInfo}} />`
    );

    assert
      .dom('[data-test-subscription-page-header]')
      .exists('Subscription page header exists');

    assert
      .dom('[data-test-subscription-page-header]')
      .containsText(t('subscriptionDetails'));

    assert
      .dom('[data-test-subscription-page-subtitle]')
      .containsText(t('subscriptionDetailsSubtitle'));

    // Check subscription items
    const items = findAll('[data-test-subscription-item]');

    assert.strictEqual(items.length, 4);

    // Verify each item
    const expectedItems = [
      {
        label: t('subscriptionStartDate'),
        value: dayjs(subscriptionInfo.start_date).format('MMM DD, YYYY'),
      },
      {
        label: t('subscriptionEndDate'),
        value: dayjs(subscriptionInfo.expiry_date).format('MMM DD, YYYY'),
      },
      {
        label: t('licensesProcured'),
        value: String(subscriptionInfo.original_licenses),
      },
      {
        label: t('licensesRemaining'),
        value: String(subscriptionInfo.licenses_remaining),
      },
    ];

    expectedItems.forEach((item, index) => {
      assert
        .dom(`[data-test-subscription-item="${item.label}"]`)
        .containsText(item.label, `Item ${index + 1} has correct label`);

      assert
        .dom(`[data-test-subscription-item="${item.label}"]`)
        .containsText(item.value, `Item ${index + 1} has correct value`);
    });
  });

  test('it handles null start date', async function (assert) {
    const subscriptionInfo = this.server.create('subscription-info', {
      start_date: null,
      original_licenses: 10,
      licenses_remaining: 5,
    });

    const subModel = this.store.push(
      this.store.normalize('subscription-info', subscriptionInfo.toJSON())
    );

    this.set('subscriptionInfo', subModel);

    await render(
      hbs`<SubscriptionPage @subscriptionInfo={{this.subscriptionInfo}} />`
    );

    const startDateItem = this.element.querySelector(
      '[data-test-subscription-item]'
    );

    assert.dom(startDateItem).containsText(t('subscriptionStartDate'));
    assert.dom(startDateItem).containsText('-');
  });

  test('it handles null expiry date', async function (assert) {
    const subscriptionInfo = this.server.create('subscription-info', {
      start_date: '2024-01-01T00:00:00Z',
      expiry_date: null,
      original_licenses: 10,
      licenses_remaining: 5,
    });

    const subModel = this.store.push(
      this.store.normalize('subscription-info', subscriptionInfo.toJSON())
    );

    this.set('subscriptionInfo', subModel);

    await render(
      hbs`<SubscriptionPage @subscriptionInfo={{this.subscriptionInfo}} />`
    );

    const expiryDateItem = this.element.querySelectorAll(
      '[data-test-subscription-item]'
    )[1];

    assert.dom(expiryDateItem).containsText(t('subscriptionEndDate'));
    assert.dom(expiryDateItem).containsText('-');
  });

  test('it handles null original licenses', async function (assert) {
    const subscriptionInfo = this.server.create('subscription-info', {
      start_date: '2024-01-01T00:00:00Z',
      expiry_date: '2024-12-31T23:59:59Z',
      original_licenses: null,
      licenses_remaining: 5,
    });

    const subModel = this.store.push(
      this.store.normalize('subscription-info', subscriptionInfo.toJSON())
    );

    this.set('subscriptionInfo', subModel);

    await render(
      hbs`<SubscriptionPage @subscriptionInfo={{this.subscriptionInfo}} />`
    );

    const originalLicensesItem = this.element.querySelectorAll(
      '[data-test-subscription-item]'
    )[2];

    assert.dom(originalLicensesItem).containsText(t('licensesProcured'));
    assert.dom(originalLicensesItem).containsText('-');
  });

  test('it handles null licenses remaining', async function (assert) {
    const subscriptionInfo = this.server.create('subscription-info', {
      start_date: '2024-01-01T00:00:00Z',
      expiry_date: '2024-12-31T23:59:59Z',
      original_licenses: 10,
      licenses_remaining: null,
    });

    const subModel = this.store.push(
      this.store.normalize('subscription-info', subscriptionInfo.toJSON())
    );

    this.set('subscriptionInfo', subModel);

    await render(
      hbs`<SubscriptionPage @subscriptionInfo={{this.subscriptionInfo}} />`
    );

    const licensesRemainingItem = find(
      `[data-test-subscription-item="${t('licensesRemaining')}"]`
    );

    assert.dom(licensesRemainingItem).containsText(t('licensesRemaining'));
    assert.dom(licensesRemainingItem).containsText('-');
  });

  test('it handles zero licenses remaining', async function (assert) {
    const subscriptionInfo = this.server.create('subscription-info', {
      start_date: '2024-01-01T00:00:00Z',
      expiry_date: '2024-12-31T23:59:59Z',
      original_licenses: 10,
      licenses_remaining: 0,
    });

    const subModel = this.store.push(
      this.store.normalize('subscription-info', subscriptionInfo.toJSON())
    );

    this.set('subscriptionInfo', subModel);

    await render(
      hbs`<SubscriptionPage @subscriptionInfo={{this.subscriptionInfo}} />`
    );

    const licensesRemainingItem = this.element.querySelectorAll(
      '[data-test-subscription-item]'
    )[3];

    assert.dom(licensesRemainingItem).containsText(t('licensesRemaining'));
    assert.dom(licensesRemainingItem).containsText('0');
  });

  test('it formats dates correctly', async function (assert) {
    const subscriptionInfo = this.server.create('subscription-info', {
      start_date: '2024-06-15T10:30:00Z',
      expiry_date: '2025-12-25T23:59:59Z',
      original_licenses: 20,
      licenses_remaining: 15,
    });

    const subModel = this.store.push(
      this.store.normalize('subscription-info', subscriptionInfo.toJSON())
    );

    this.set('subscriptionInfo', subModel);

    await render(
      hbs`<SubscriptionPage @subscriptionInfo={{this.subscriptionInfo}} />`
    );

    assert
      .dom(`[data-test-subscription-item="${t('subscriptionStartDate')}"]`)
      .containsText(dayjs(subscriptionInfo.start_date).format('MMM DD, YYYY'));

    assert
      .dom(`[data-test-subscription-item="${t('subscriptionEndDate')}"]`)
      .containsText(dayjs(subscriptionInfo.expiry_date).format('MMM DD, YYYY'));
  });

  test('it handles all null values gracefully', async function (assert) {
    const subscriptionInfo = this.server.create('subscription-info', {
      start_date: null,
      expiry_date: null,
      original_licenses: null,
      licenses_remaining: null,
    });

    const subModel = this.store.push(
      this.store.normalize('subscription-info', subscriptionInfo.toJSON())
    );

    this.set('subscriptionInfo', subModel);

    await render(
      hbs`<SubscriptionPage @subscriptionInfo={{this.subscriptionInfo}} />`
    );

    const items = findAll('[data-test-subscription-item]');

    assert.strictEqual(items.length, 4, 'All 4 items render even with nulls');

    // All values should show '-'
    items.forEach((item) => {
      assert.dom(item).containsText('-', 'Item shows dash for null value');
    });
  });
});
