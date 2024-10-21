import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { Response } from 'miragejs';

import Service from '@ember/service';

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

module('Integration | Component | organization-email-domain', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    await this.server.createList('organization', 2);
    const organization = this.server.schema.organizations.first();
    const currentUser = this.server.create('current-user', {
      organization: organization,
    });

    this.server.create('organization-me', {
      id: currentUser.id,
    });

    await this.owner.lookup('service:organization').load();

    await this.owner.lookup('service:me');

    this.owner.register('service:notifications', NotificationsStub);

    const domains = this.server.createList('organization-email-domain', 5);

    this.setProperties({ domains });
  });

  test('it should render empty organization-email-domain and not editable', async function (assert) {
    this.server.get('/organizations/:id/email_domains', () => {
      return [];
    });

    await render(hbs`<OrganizationEmailDomain />`);

    assert
      .dom('[data-test-orgEmailDomain-title]')
      .hasText(t('emailDomainRestriction'));

    assert
      .dom('[data-test-orgEmailDomain-subtitle]')
      .hasText(t('emailRestrictDesc'));

    assert.dom('[data-test-orgEmailDomain-input]').doesNotExist();
    assert.dom('[data-test-orgEmailDomain-saveBtn]').doesNotExist();
    assert.dom('[data-test-orgEmailDomain-chip]').doesNotExist();
  });

  test('it should render organization-email-domain with email domains and not editable', async function (assert) {
    this.server.get('/organizations/:id/email_domains', (schema) => {
      return schema.organizationEmailDomains.all().models;
    });

    await render(hbs`<OrganizationEmailDomain />`);

    assert
      .dom('[data-test-orgEmailDomain-title]')
      .hasText(t('emailDomainRestriction'));

    assert
      .dom('[data-test-orgEmailDomain-subtitle]')
      .hasText(t('emailRestrictDesc'));

    assert.dom('[data-test-orgEmailDomain-input]').doesNotExist();
    assert.dom('[data-test-orgEmailDomain-saveBtn]').doesNotExist();

    assert.strictEqual(findAll('[data-test-orgEmailDomain-chip]').length, 5);
  });

  test.each(
    'it should handle delete domain',
    [{ fail: false }, { fail: true }],
    async function (assert, { fail }) {
      this.set('isEditable', true);

      this.server.get('/organizations/:id/email_domains', (schema) => {
        return schema.organizationEmailDomains.all().models;
      });

      this.server.delete(
        '/organizations/:org_id/email_domains/:id',
        (schema, req) => {
          return fail
            ? new Response(500)
            : schema.organizationEmailDomains.find(req.params.id).destroy();
        }
      );

      await render(
        hbs`<OrganizationEmailDomain @isEditable={{this.isEditable}}/>`
      );

      assert.strictEqual(findAll('[data-test-orgEmailDomain-chip]').length, 5);

      const chipSelector = `[data-test-orgEmailDomain-chip="${1}-${this.domains[1].id}"]`;

      await click(`${chipSelector} [data-test-chip-delete-btn]`);

      const notify = this.owner.lookup('service:notifications');

      if (fail) {
        assert.strictEqual(
          findAll('[data-test-orgEmailDomain-chip]').length,
          5
        );

        assert.dom(chipSelector).exists();
        assert.strictEqual(
          notify.errorMsg,
          'The backend responded with an error'
        );
      } else {
        assert.strictEqual(
          findAll('[data-test-orgEmailDomain-chip]').length,
          4
        );

        assert.dom(chipSelector).doesNotExist();
        assert.strictEqual(notify.successMsg, t('domainDeleted'));
      }
    }
  );

  test.each(
    'it should handle add domain',
    [{ fail: false }, { fail: true }],
    async function (assert, { fail }) {
      this.server.get('/organizations/:id/email_domains', () => {
        return [];
      });

      this.server.post('/organizations/:id/email_domains', (schema, req) => {
        if (fail) {
          return new Response(500);
        }

        const domain = schema.organizationEmailDomains.create(
          JSON.parse(req.requestBody)
        );

        this.set('response', domain);

        return domain.toJSON();
      });

      this.set('isEditable', true);

      await render(
        hbs`<OrganizationEmailDomain @isEditable={{this.isEditable}}/>`
      );

      assert.strictEqual(findAll('[data-test-orgEmailDomain-chip]').length, 0);

      await fillIn('[data-test-orgEmailDomain-input]', 'test.io');

      await click('[data-test-orgEmailDomain-saveBtn]');

      const notify = this.owner.lookup('service:notifications');

      if (fail) {
        assert.strictEqual(
          notify.errorMsg,
          'The backend responded with an error'
        );

        assert.strictEqual(
          findAll('[data-test-orgEmailDomain-chip]').length,
          0
        );

        assert.dom('[data-test-orgEmailDomain-chip]').doesNotExist();
      } else {
        assert.strictEqual(
          notify.successMsg,
          `${this.response.domain_name} ${t('addedSuccessfully')}`
        );

        assert.strictEqual(
          findAll('[data-test-orgEmailDomain-chip]').length,
          1
        );

        assert
          .dom(`[data-test-orgEmailDomain-chip="0-${this.response.id}"]`)
          .hasText(this.response.domain_name);
      }
    }
  );

  test('add domain btn should be disabled by default & enabled only if input exist', async function (assert) {
    this.server.get('/organizations/:id/email_domains', () => {
      return [];
    });

    this.set('isEditable', true);

    await render(
      hbs`<OrganizationEmailDomain @isEditable={{this.isEditable}}/>`
    );

    assert.dom('[data-test-orgEmailDomain-input]').isNotDisabled().hasNoValue();
    assert.dom('[data-test-orgEmailDomain-saveBtn]').isDisabled();

    await fillIn('[data-test-orgEmailDomain-input]', 'test.io');

    assert
      .dom('[data-test-orgEmailDomain-input]')
      .isNotDisabled()
      .hasValue('test.io');

    assert.dom('[data-test-orgEmailDomain-saveBtn]').isNotDisabled();
  });
});
