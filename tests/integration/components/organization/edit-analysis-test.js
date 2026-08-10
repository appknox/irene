import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { click, find, render, waitFor, waitUntil } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import { Response } from 'miragejs';

class NotificationsStub extends Service {
  errorMsg = null;
  successMsg = null;

  error(msg) {
    this.errorMsg = msg;
  }

  success(msg) {
    this.successMsg = msg;
  }
}

// ─── Selectors ─────────────────────────────────────────────────────────────────
const selectors = {
  container: '[data-test-orgEditAnalysis-container]',
  title: '[data-test-orgEditAnalysis-title]',
  toggleLabel: '[data-test-orgEditAnalysis-toggleLabel]',
  description: '[data-test-orgEditAnalysis-description]',
  toggle: '[data-test-orgEditAnalysis-toggle]',
  toggleInput: '[data-test-orgEditAnalysis-toggle] [data-test-toggle-input]',
  loader: '[data-test-orgEditAnalysis-loader]',
};

// ─── Template ──────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`<Organization::EditAnalysis
  @organization={{this.organization}}
/>`;

// ─── Test suite ────────────────────────────────────────────────────────────────
module(
  'Integration | Component | organization/edit-analysis',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.owner.register('service:notifications', NotificationsStub);

      const store = this.owner.lookup('service:store');
      const record = this.server.create('organization');

      const organization = store.push(
        store.normalize('organization', record.toJSON())
      );

      // Default to disabled
      organization.set('features', { member_override_request: false });

      this.setProperties({
        organization,
        notify: this.owner.lookup('service:notifications'),
        patchRequests: [],
      });
    });

    // ─── Rendering ───────────────────────────────────────────────────────────
    test('it renders the title, toggle label and description', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.container).exists();
      assert.dom(selectors.title).hasText(t('editAnalysis'));

      assert
        .dom(selectors.toggleLabel)
        .hasText(t('allowEditAnalysisForMembers'));

      assert
        .dom(selectors.description)
        .hasText(t('editAnalysisForMembersDescription'));
    });

    test('it renders the toggle unchecked when the feature is disabled', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.toggleInput).isNotChecked();
      assert.dom(selectors.toggleInput).isNotDisabled();
      assert.dom(selectors.loader).doesNotExist();
    });

    test('it renders the toggle checked when the feature is enabled', async function (assert) {
      this.organization.set('features', { member_override_request: true });

      await render(TEMPLATE);

      assert.dom(selectors.toggleInput).isChecked();
    });

    // ─── Loading state ───────────────────────────────────────────────────────
    test('it shows the loader and disables the toggle while the request is in flight', async function (assert) {
      this.server.patch(
        '/organizations/:id/member_override_request_feature',
        () => ({}),
        { timing: 150 }
      );

      await render(TEMPLATE);

      assert.dom(selectors.loader).doesNotExist();
      assert.dom(selectors.toggleInput).isNotDisabled();

      click(selectors.toggleInput);

      await waitFor(selectors.loader, { timeout: 500 });

      assert.dom(selectors.loader).exists();
      assert.dom(selectors.toggleInput).isDisabled();

      await waitUntil(() => !find(selectors.loader), { timeout: 1000 });

      assert.dom(selectors.loader).doesNotExist();
      assert.dom(selectors.toggleInput).isNotDisabled();
    });

    // ─── Enable / disable ────────────────────────────────────────────────────
    test('enabling the toggle sends the feature flag, updates the organization and notifies', async function (assert) {
      this.server.patch(
        '/organizations/:id/member_override_request_feature',
        (_schema, request) => {
          this.patchRequests.push(request);

          return {};
        }
      );

      await render(TEMPLATE);

      assert.dom(selectors.toggleInput).isNotChecked();
      assert.false(this.organization.features.member_override_request);
      assert.strictEqual(this.notify.successMsg, null);

      await click(selectors.toggleInput);

      assert.strictEqual(this.patchRequests.length, 1);
      assert.deepEqual(JSON.parse(this.patchRequests[0].requestBody), {
        member_override_request: true,
      });

      assert.true(this.organization.features.member_override_request);
      assert.dom(selectors.toggleInput).isChecked();

      assert.strictEqual(
        this.notify.successMsg,
        t('allowEditAnalysisForMembersChanged'),
        'shows success notification'
      );
    });

    test('disabling the toggle sends the feature flag as false and updates the organization', async function (assert) {
      this.organization.set('features', { member_override_request: true });

      this.server.patch(
        '/organizations/:id/member_override_request_feature',
        (_schema, request) => {
          this.patchRequests.push(request);

          return {};
        }
      );

      await render(TEMPLATE);

      assert.dom(selectors.toggleInput).isChecked();
      assert.true(this.organization.features.member_override_request);

      await click(selectors.toggleInput);

      assert.strictEqual(this.patchRequests.length, 1);
      assert.deepEqual(JSON.parse(this.patchRequests[0].requestBody), {
        member_override_request: false,
      });

      assert.false(this.organization.features.member_override_request);
      assert.dom(selectors.toggleInput).isNotChecked();

      assert.strictEqual(
        this.notify.successMsg,
        t('allowEditAnalysisForMembersChanged'),
        'shows success notification'
      );
    });

    test('it requests the member override request feature endpoint for the organization', async function (assert) {
      this.server.patch(
        '/organizations/:id/member_override_request_feature',
        (_schema, request) => {
          this.patchRequests.push(request);

          return {};
        }
      );

      await render(TEMPLATE);

      await click(selectors.toggleInput);

      assert.true(
        this.patchRequests[0].url.endsWith(
          `/api/organizations/${this.organization.id}/member_override_request_feature`
        ),
        `expected the request URL to target the organization endpoint, got ${this.patchRequests[0].url}`
      );
    });

    // ─── Error path ──────────────────────────────────────────────────────────
    test('a failed request notifies the error and leaves the feature unchanged', async function (assert) {
      this.server.patch(
        '/organizations/:id/member_override_request_feature',
        () => new Response(400, {}, { detail: 'Unable to update feature' })
      );

      await render(TEMPLATE);

      assert.dom(selectors.toggleInput).isNotChecked();
      assert.false(this.organization.features.member_override_request);

      await click(selectors.toggleInput);

      assert.strictEqual(
        this.notify.errorMsg,
        'Unable to update feature',
        'shows error notification'
      );

      assert.strictEqual(this.notify.successMsg, null);
      assert.false(this.organization.features.member_override_request);

      assert
        .dom(selectors.toggleInput)
        .isNotChecked('toggle reverts when the request fails');
    });
  }
);
