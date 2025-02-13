import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import Service from '@ember/service';

class NotificationStub extends Service {
  successMsg = '';
  errorMsg = '';

  error(msg) {
    this.errorMsg = msg;
  }

  success(msg) {
    this.successMsg = msg;
  }
}

module('Integration | Component | api-filter', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');

  hooks.beforeEach(function () {
    this.owner.register('service:notifications', NotificationStub);

    this.profile = this.server.create('profile');
    this.store = this.owner.lookup('service:store');
  });

  test('it renders', async function (assert) {
    this.server.get('/profiles/:id/api_scan_options', (_, req) => {
      return { ds_api_capture_filters: [], id: req.params.id };
    });

    await render(hbs`<ApiFilter @profileId={{this.profile.id}} />`);

    assert
      .dom('[data-test-apiFilter-title]')
      .hasText(t('templates.apiScanURLFilter'));

    assert
      .dom('[data-test-apiFilter-description]')
      .hasText(t('otherTemplates.specifyTheURL'));

    assert
      .dom('[data-test-apiFilter-apiEndpointInput]')
      .isNotDisabled()
      .hasNoValue();

    assert.dom('[data-test-helper-text]').hasText(t('templates.enterEndpoint'));

    assert
      .dom('[data-test-apiFilter-addApiEndpointBtn]')
      .isNotDisabled()
      .hasText(t('templates.addNewUrlFilter'));

    assert.dom('[data-test-apiFilter-table]').doesNotExist();
  });

  test('it handles URL validation and addition', async function (assert) {
    this.server.get('/profiles/:id/api_scan_options', (_, req) => {
      return { ds_api_capture_filters: [], id: req.params.id };
    });

    this.server.put('/profiles/:id/api_scan_options', (schema, req) => {
      const { ds_api_capture_filters } = JSON.parse(req.requestBody);

      return {
        ds_api_capture_filters,
        id: this.profile.id,
      };
    });

    await render(hbs`<ApiFilter @profileId={{this.profile.id}} />`);

    const notify = this.owner.lookup('service:notifications');

    // Test empty input validation
    await click('[data-test-apiFilter-addApiEndpointBtn]');

    assert.strictEqual(notify.errorMsg, t('emptyURLFilter'));

    // Test invalid URL validation
    await fillIn(
      '[data-test-apiFilter-apiEndpointInput]',
      'https://api.example.com'
    );

    await click('[data-test-apiFilter-addApiEndpointBtn]');

    assert.strictEqual(
      notify.errorMsg,
      `https://api.example.com ${t('invalidURL')}`
    );

    // Test valid URL addition
    await fillIn('[data-test-apiFilter-apiEndpointInput]', 'api.example.com');
    await click('[data-test-apiFilter-addApiEndpointBtn]');

    assert.strictEqual(notify.successMsg, t('urlUpdated'));

    assert.dom('[data-test-apiFilter-table]').exists();

    // Add second URL
    await fillIn('[data-test-apiFilter-apiEndpointInput]', 'api.example2.com');
    await click('[data-test-apiFilter-addApiEndpointBtn]');

    // Verify table headers
    const headers = findAll('[data-test-apiFilter-thead] th');
    assert.strictEqual(headers.length, 2);

    assert.dom(headers[0]).hasText(t('apiURLFilter'));
    assert.dom(headers[1]).hasText(t('action'));

    // Verify table rows
    const rows = findAll('[data-test-apiFilter-row]');
    assert.strictEqual(rows.length, 2);

    const firstRowCells = rows[0].querySelectorAll(
      '[data-test-apiFilter-cell]'
    );

    assert.dom(firstRowCells[0]).hasText('api.example.com');

    assert
      .dom('[data-test-apiFilter-deleteBtn]', firstRowCells[1])
      .isNotDisabled();
  });

  test('it handles URL deletion', async function (assert) {
    this.server.get('/profiles/:id/api_scan_options', (_, req) => {
      return {
        ds_api_capture_filters: ['api1.example.com', 'api2.example.com'],
        id: req.params.id,
      };
    });

    this.server.put('/profiles/:id/api_scan_options', (schema, req) => {
      const { ds_api_capture_filters } = JSON.parse(req.requestBody);

      return {
        ds_api_capture_filters,
        id: this.profile.id,
      };
    });

    await render(hbs`<ApiFilter @profileId={{this.profile.id}} />`);

    const rows = findAll('[data-test-apiFilter-row]');
    assert.strictEqual(rows.length, 2);

    let firstRowCells = rows[0].querySelectorAll('[data-test-apiFilter-cell]');

    // Click delete button
    await click(
      firstRowCells[1].querySelector('[data-test-apiFilter-deleteBtn]')
    );

    // Verify confirmation modal
    assert
      .dom(findAll('[data-test-ak-modal-header]')[0])
      .exists()
      .hasText(t('confirm'));

    assert
      .dom('[data-test-confirmbox-description]')
      .hasText(t('confirmBox.removeURL'));

    assert
      .dom('[data-test-confirmbox-confirmBtn]')
      .isNotDisabled()
      .hasText(t('yes'));

    // Confirm deletion
    await click('[data-test-confirmbox-confirmBtn]');

    // Verify URL was deleted
    const notify = this.owner.lookup('service:notifications');

    assert.strictEqual(notify.successMsg, t('urlUpdated'));
    assert.strictEqual(findAll('[data-test-apiFilter-row]').length, 1);

    firstRowCells = rows[0].querySelectorAll('[data-test-apiFilter-cell]');

    assert.dom(firstRowCells[0]).hasText('api2.example.com');
  });

  test('it hides description when hideDescriptionText is true', async function (assert) {
    this.server.get('/profiles/:id/api_scan_options', (_, req) => {
      return { ds_api_capture_filters: [], id: req.params.id };
    });

    await render(
      hbs`<ApiFilter @profileId={{this.profile.id}} @hideDescriptionText={{true}} />`
    );

    assert.dom('[data-test-apiFilter-description]').doesNotExist();
  });
});
