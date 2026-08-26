import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { find, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

// ─── Selectors ─────────────────────────────────────────────────────────────────
const selectors = {
  editAnalysisTitle: '[data-test-orgEditAnalysis-title]',
  editAnalysisToggle: '[data-test-orgEditAnalysis-toggle]',
  mfaTitle: '[data-test-mfa-title]',
  emailDomain: '[data-test-orgEmailDomain-title]',
};

// ─── Template ──────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`<Organization::Settings @model={{this.model}} />`;

const ownerRole = { is_owner: true, is_admin: true };
const adminRole = { is_owner: false, is_admin: true };
const memberRole = { is_owner: false, is_admin: false };

module('Integration | Component | organization/settings', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');

  hooks.beforeEach(async function () {
    this.server.createList('organization', 1);
    this.server.createList('organization-me', 1, ownerRole);

    this.server.get('/organizations/:id/me', (schema, req) =>
      schema.organizationMes.find(`${req.params.id}`)?.toJSON()
    );

    const organization = this.owner.lookup('service:organization');
    await organization.load();

    const store = this.owner.lookup('service:store');

    const userRecord = this.server.create('user');

    const user = store.push(
      store.normalize('user', {
        attributes: userRecord.toJSON(),
        id: userRecord.id,
        type: 'user',
      })
    );

    this.setProperties({
      model: { organization: organization.selected, user },
    });
  });

  test.each(
    'the edit analysis toggle renders only for owners',
    [
      [ownerRole, true],
      [adminRole, false],
      [memberRole, false],
    ],
    async function (assert, [role, visible]) {
      this.server.db.organizationMes.update('1', role);

      await render(TEMPLATE);

      if (visible) {
        assert.dom(selectors.editAnalysisTitle).hasText(t('editAnalysis'));
        assert.dom(selectors.editAnalysisToggle).exists();
      } else {
        assert.dom(selectors.editAnalysisTitle).doesNotExist();
        assert.dom(selectors.editAnalysisToggle).doesNotExist();
      }
    }
  );

  test('the edit analysis section renders above the MFA section for owners', async function (assert) {
    await render(TEMPLATE);

    const editAnalysis = find(selectors.editAnalysisTitle);
    const mfa = find(selectors.mfaTitle);

    assert.dom(selectors.editAnalysisTitle).hasText(t('editAnalysis'));
    assert.dom(selectors.mfaTitle).hasText(t('multiFactorAuth'));

    assert.true(
      Boolean(
        editAnalysis.compareDocumentPosition(mfa) &
          Node.DOCUMENT_POSITION_FOLLOWING
      ),
      'edit analysis is rendered before multi factor auth'
    );
  });
});
