import { click, fillIn, render, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { Response } from 'miragejs';

import Service from '@ember/service';
import dayjs from 'dayjs';

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

module(
  'Integration | Component | admin/service-account/section/account-overview',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      const store = this.owner.lookup('service:store');

      const serviceAccount = this.server.create('service-account');

      const user = this.server.create('organization-user', {
        id: serviceAccount.created_by_user,
      });

      const normalized = store.normalize(
        'service-account',
        serviceAccount.toJSON()
      );

      this.owner.register('service:notifications', NotificationsStub);

      this.setProperties({
        serviceAccount: store.push(normalized),
        user,
        store,
      });
    });

    test('it renders account overview', async function (assert) {
      await render(hbs`
        <Admin::ServiceAccount::Section::AccountOverview @serviceAccount={{this.serviceAccount}} />
      `);

      assert
        .dom('[data-test-serviceAccountSection-title]')
        .hasText(t('accountOverview'));

      assert
        .dom('[data-test-serviceAccountSection-accountOverview-actionBtn]')
        .isNotDisabled();

      assert
        .dom('[data-test-serviceAccountSection-accountOverview-nameLabel]')
        .hasText(t('serviceAccountModule.nameOfTheServiceAccount'));

      assert
        .dom('[data-test-serviceAccountSection-accountOverview-auditInfoIcon]')
        .exists();

      assert
        .dom('[data-test-serviceAccountSection-accountOverview-nameValue]')
        .hasText(this.serviceAccount.name);

      assert
        .dom(
          '[data-test-serviceAccountSection-accountOverview-descriptionLabel]'
        )
        .hasText(t('description'));

      assert
        .dom(
          '[data-test-serviceAccountSection-accountOverview-descriptionValue]'
        )
        .hasText(this.serviceAccount.description);

      assert.dom('[data-test-serviceAccountSection-footer]').doesNotExist();
    });

    test('it renders audit info tooltip content', async function (assert) {
      this.server.get('/organizations/:id/users/:userId', (schema, req) => {
        return schema.organizationUsers.find(req.params.userId).toJSON();
      });

      await render(hbs`
        <Admin::ServiceAccount::Section::AccountOverview @serviceAccount={{this.serviceAccount}} />
      `);

      assert
        .dom('[data-test-serviceAccountSection-title]')
        .hasText(t('accountOverview'));

      assert
        .dom('[data-test-serviceAccountSection-accountOverview-auditInfoIcon]')
        .exists();

      await triggerEvent(
        '[data-test-serviceAccountSection-accountOverview-auditInfoIcon]',
        'mouseenter'
      );

      const auditInfo = [
        {
          title: t('createdOn'),
          value: dayjs(this.serviceAccount.createdOn).format(
            'MMMM DD, YYYY, hh:mm'
          ),
        },
        {
          title: t('createdBy'),
          value: `${this.user.username} (${this.user.email})`,
        },
        {
          title: t('updatedOn'),
          value: dayjs(this.serviceAccount.updatedOn).format(
            'MMMM DD, YYYY, hh:mm'
          ),
        },
        {
          title: t('updatedBy'),
          value: `${this.user.username} (${this.user.email})`,
        },
      ];

      auditInfo.forEach((info) => {
        const title = info.title.toUpperCase();

        assert
          .dom(
            `[data-test-serviceAccountSection-accountOverview-auditInfoTitle="${title}"]`
          )
          .hasText(title);

        assert
          .dom(
            `[data-test-serviceAccountSection-accountOverview-auditInfoValue="${title}"]`
          )
          .hasText(info.value);
      });
    });

    test('it shows validation error for name & description', async function (assert) {
      await render(hbs`
        <Admin::ServiceAccount::Section::AccountOverview @serviceAccount={{this.serviceAccount}} />
      `);

      await click(
        '[data-test-serviceAccountSection-accountOverview-actionBtn]'
      );

      assert
        .dom('[data-test-serviceAccountSection-accountOverview-actionBtn]')
        .doesNotExist();

      // fill in empty name & description
      await fillIn(
        '[data-test-serviceAccountSection-accountOverview-nameInput]',
        ''
      );

      await fillIn(
        '[data-test-serviceAccountSection-accountOverview-descriptionInput]',
        ''
      );

      assert.dom('[data-test-helper-text]').hasText("Name can't be blank");

      assert
        .dom(
          '[data-test-serviceAccountSection-accountOverview-descriptionInputError]'
        )
        .hasText("Description can't be blank");
    });

    test.each(
      'it should edit account overview',
      [false, true],
      async function (assert, fail) {
        assert.expect(fail ? 16 : 18);

        this.server.put('/service_accounts/:id', (schema, req) => {
          if (fail) {
            return new Response(
              502,
              {},
              { detail: 'Service account update failed' }
            );
          }

          return schema.serviceAccounts
            .find(req.params.id)
            .update(JSON.parse(req.requestBody))
            .toJSON();
        });

        await render(hbs`
        <Admin::ServiceAccount::Section::AccountOverview @serviceAccount={{this.serviceAccount}} />
      `);

        assert
          .dom('[data-test-serviceAccountSection-title]')
          .hasText(t('accountOverview'));

        assert
          .dom('[data-test-serviceAccountSection-accountOverview-actionBtn]')
          .isNotDisabled();

        await click(
          '[data-test-serviceAccountSection-accountOverview-actionBtn]'
        );

        assert
          .dom('[data-test-serviceAccountSection-accountOverview-actionBtn]')
          .doesNotExist();

        assert
          .dom('[data-test-form-label]')
          .containsText(t('serviceAccountModule.nameOfTheServiceAccount'));

        assert
          .dom(
            '[data-test-serviceAccountSection-accountOverview-auditInfoIcon]'
          )
          .doesNotExist();

        assert
          .dom('[data-test-serviceAccountSection-accountOverview-nameInput]')
          .hasValue(this.serviceAccount.name);

        assert
          .dom(
            '[data-test-serviceAccountSection-accountOverview-descriptionLabel]'
          )
          .containsText(t('description'));

        assert
          .dom(
            '[data-test-serviceAccountSection-accountOverview-descriptionInput]'
          )
          .hasValue(this.serviceAccount.description);

        assert.dom('[data-test-serviceAccountSection-footer]').exists();

        assert
          .dom('[data-test-serviceAccountSection-accountOverview-updateBtn]')
          .isNotDisabled()
          .hasText(t('update'));

        assert
          .dom('[data-test-serviceAccountSection-accountOverview-cancelBtn]')
          .isNotDisabled()
          .hasText(t('cancel'));

        const updatedName = 'Testing name update';
        const updatedDescription = 'Testing description update';

        // modify and edit overview
        await fillIn(
          '[data-test-serviceAccountSection-accountOverview-nameInput]',
          updatedName
        );

        await fillIn(
          '[data-test-serviceAccountSection-accountOverview-descriptionInput]',
          updatedDescription
        );

        await click(
          '[data-test-serviceAccountSection-accountOverview-updateBtn]'
        );

        const notify = this.owner.lookup('service:notifications');

        if (fail) {
          assert.strictEqual(notify.errorMsg, 'Service account update failed');

          assert.dom('[data-test-serviceAccountSection-footer]').exists();

          assert
            .dom('[data-test-serviceAccountSection-accountOverview-actionBtn]')
            .doesNotExist();
        } else {
          assert.strictEqual(
            notify.successMsg,
            t('serviceAccountModule.editSuccessMsg')
          );

          assert
            .dom('[data-test-serviceAccountSection-accountOverview-nameValue]')
            .hasText(updatedName);

          assert
            .dom(
              '[data-test-serviceAccountSection-accountOverview-descriptionValue]'
            )
            .hasText(updatedDescription);

          assert.dom('[data-test-serviceAccountSection-footer]').doesNotExist();

          assert
            .dom('[data-test-serviceAccountSection-accountOverview-actionBtn]')
            .isNotDisabled();
        }
      }
    );
  }
);
