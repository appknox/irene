import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { Response } from 'miragejs';

// ─── Selectors ─────────────────────────────────────────────────────────────────
const selectors = {
  note: '[data-test-analysisRisk-overrideEditDrawer-slaNote]',
};

// ─── Template ──────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`<AnalysisRisk::OverrideEditDrawer::SlaNote />`;

const SLA_URL = '/organizations/:id/vulnerability-sla';

// ─── Test suite ────────────────────────────────────────────────────────────────
module(
  'Integration | Component | analysis-risk/override-edit-drawer/sla-note',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      this.server.createList('organization', 1);
      this.server.createList('organization-me', 1);

      this.server.get('/organizations/:id/me', (schema, req) =>
        schema.organizationMes.find(`${req.params.id}`)?.toJSON()
      );

      await this.owner.lookup('service:organization').load();

      this.server.create('organization-vulnerability-sla', { id: '1' });

      this.setProperties({
        requests: [],
        organization: this.owner.lookup('service:organization').selected,
      });

      this.server.get(SLA_URL, (schema, request) => {
        this.requests.push(request);

        return schema.organizationVulnerabilitySlas.find('1').toJSON();
      });
    });

    test('it renders the note when the organization SLA is enabled', async function (assert) {
      this.server.db.organizationVulnerabilitySlas.update('1', {
        enabled: true,
      });

      await render(TEMPLATE);

      assert
        .dom(selectors.note)
        .hasText(`${t('note')} - ${t('editOverrideVulnerability.slaNote')}`);
    });

    test('it renders nothing when the organization SLA is disabled', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.note).doesNotExist();
    });

    test('it renders nothing when the SLA cannot be loaded', async function (assert) {
      this.server.get(
        SLA_URL,
        () => new Response(500, {}, { detail: 'Server error' })
      );

      await render(TEMPLATE);

      assert.dom(selectors.note).doesNotExist();
    });

    test('it requests the SLA of the selected organization', async function (assert) {
      await render(TEMPLATE);

      assert.strictEqual(this.requests.length, 1);

      assert.true(
        this.requests[0].url.endsWith(
          `/api/organizations/${this.organization.id}/vulnerability-sla`
        ),
        `expected the organization SLA endpoint, got ${this.requests[0].url}`
      );
    });
  }
);
