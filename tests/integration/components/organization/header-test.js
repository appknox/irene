import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import faker from 'faker';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | organization/header', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  test('it should show label and org name', async function (assert) {
    this.set('name', faker.company.companyName());
    await render(hbs`<Organization::Header @name={{this.name}}/>`);
    assert.dom(`[data-test-org-name-label]`).hasText(`t:organizationName:()`);
    assert.dom(`[data-test-org-name-text]`).hasText(this.name);
  });

  test('it should show ellipsis for 255 chars', async function (assert) {
    this.set('name', 'a'.repeat(255));
    await render(hbs`<Organization::Header @name={{this.name}}/>`);
    const orgNameTextEl = this.element.querySelector(
      `[data-test-org-name-text]`
    );
    assert.true(
      orgNameTextEl.scrollWidth > orgNameTextEl.clientWidth,
      'Ellipsis applied'
    );
  });

  test('it should not show ellipsis for 50 chars', async function (assert) {
    this.set('name', 'a'.repeat(50));
    await render(hbs`<Organization::Header @name={{this.name}}/>`);
    const orgNameTextEl = this.element.querySelector(
      `[data-test-org-name-text]`
    );
    assert.false(
      orgNameTextEl.scrollWidth > orgNameTextEl.clientWidth,
      'Ellipsis not applied'
    );
  });

  test('it should show org settings button with link to organization-settings route', async function (assert) {
    this.set('isAdmin', true);
    await render(hbs`<Organization::Header @isAdmin={{this.isAdmin}}/>`);
    assert
      .dom(`[data-test-org-settings-link]`)
      .hasAttribute('href', '/organization-settings');
    assert.dom(`[data-test-org-settings-link]`).doesNotHaveAttribute('target');
  });

  test('it should not show org settings button', async function (assert) {
    this.set('isAdmin', false);
    await render(hbs`<Organization::Header @isAdmin={{this.isAdmin}}/>`);
    assert.dom(`[data-test-org-settings-link]`).doesNotExist();
  });
});
