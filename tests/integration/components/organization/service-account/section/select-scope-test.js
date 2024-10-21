import { click, find, render, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
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

const scopeDetails = () => [
  {
    key: 'projects-read',
    scopeLabel: t('serviceAccountModule.scopes.projects.label'),
    scopeDescription: t('serviceAccountModule.scopes.projects.readDescription'),
    accessType: t('read'),
    scopeKey: 'scopePublicApiProjectRead',
  },
  {
    key: 'scan-results-va-read',
    scopeLabel: t('serviceAccountModule.scopes.scan-results-va.label'),
    scopeDescription: t(
      'serviceAccountModule.scopes.scan-results-va.readDescription'
    ),
    accessType: t('read'),
    scopeKey: 'scopePublicApiScanResultVa',
  },
  {
    key: 'user-read',
    scopeLabel: t('serviceAccountModule.scopes.user.label'),
    scopeDescription: t('serviceAccountModule.scopes.user.readDescription'),
    accessType: t('read'),
    scopeKey: 'scopePublicApiUserRead',
  },
];

module(
  'Integration | Component | organization/service-account/section/select-scope',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    hooks.beforeEach(async function () {
      const store = this.owner.lookup('service:store');

      const serviceAccount = this.server.create('service-account');

      const normalized = store.normalize(
        'service-account',
        serviceAccount.toJSON()
      );

      this.owner.register('service:notifications', NotificationsStub);

      this.setProperties({
        serviceAccount: store.push(normalized),
        store,
      });
    });

    test('it renders selected scope', async function (assert) {
      await render(hbs`<Organization::ServiceAccount::Section::SelectScope
        @serviceAccount={{this.serviceAccount}}
      />`);

      assert
        .dom('[data-test-serviceAccountSection-title]')
        .hasText(t('selectedScope'));

      assert
        .dom('[data-test-serviceAccountSection-selectScope-actionBtn]')
        .isNotDisabled();

      const parentContainer = find(
        `[data-test-ak-checkbox-tree-nodeKey="public-api"]`
      );

      assert
        .dom(
          '[data-test-serviceAccountSection-selectScope-nodeLabel]',
          parentContainer
        )
        .containsText(t('serviceAccountModule.scopes.public-api.label'));

      for (const scope of scopeDetails()) {
        const container = find(
          `[data-test-ak-checkbox-tree-nodeKey="${scope.key}"]`
        );

        assert
          .dom(
            `[data-test-serviceAccountSection-selectScope-nodeLabelIcon="${this.serviceAccount.get(scope.scopeKey) ? 'checked' : 'unchecked'}"]`,
            container
          )
          .exists();

        assert
          .dom(
            '[data-test-serviceAccountSection-selectScope-nodeLabel]',
            container
          )
          .containsText(scope.scopeLabel);

        assert
          .dom(
            '[data-test-serviceAccountSection-selectScope-nodeLabelAccessType]',
            container
          )
          .containsText(scope.accessType);

        assert
          .dom(
            '[data-test-serviceAccountSection-selectScope-nodeLabelInfoIcon]',
            container
          )
          .exists();

        assert
          .dom(
            '[data-test-serviceAccountSection-selectScope-nodeLabelInfoText]'
          )
          .doesNotExist();

        await triggerEvent(
          container.querySelector(
            '[data-test-serviceAccountSection-selectScope-nodeLabelInfoIcon]'
          ),
          'mouseenter'
        );

        assert
          .dom(
            '[data-test-serviceAccountSection-selectScope-nodeLabelInfoText]'
          )
          .exists()
          .hasText(scope.scopeDescription);

        await triggerEvent(
          container.querySelector(
            '[data-test-serviceAccountSection-selectScope-nodeLabelInfoIcon]'
          ),
          'mouseleave'
        );
      }
    });

    test.each(
      'it should udpate selected scope',
      [
        {
          parentChecked: false,
          allChecked: false, // initial all checkboxes should be unchecked
          values: {
            scopePublicApiProjectRead: true,
            scopePublicApiUserRead: true,
          },
        },
        {
          parentChecked: true,
          clickParent: true,
          allChecked: false, // initial all checkboxes should be unchecked
          values: {},
        },
        {
          parentChecked: false,
          clickParent: true,
          allChecked: true, // initial all checkboxes should be checked
          values: {},
        },
        {
          allChecked: true, // initial all checkboxes should be checked
          values: {},
          fail: true,
        },
      ],
      async function (
        assert,
        { parentChecked, values, allChecked, clickParent, fail }
      ) {
        // reset values
        this.serviceAccount.updateValues({
          scope_public_api_project_read: allChecked,
          scope_public_api_scan_result_va: allChecked,
          scope_public_api_user_read: allChecked,
        });

        this.server.put('/service_accounts/:id', (schema, req) => {
          if (fail) {
            return new Response(502, {}, { detail: 'Update failed' });
          }

          const data = JSON.parse(req.requestBody);

          return schema.serviceAccounts
            .find(req.params.id)
            .update(data)
            .toJSON();
        });

        await render(hbs`<Organization::ServiceAccount::Section::SelectScope
          @serviceAccount={{this.serviceAccount}}
        />`);

        assert
          .dom('[data-test-serviceAccountSection-title]')
          .hasText(t('selectedScope'));

        assert
          .dom('[data-test-serviceAccountSection-selectScope-actionBtn]')
          .isNotDisabled();

        assert.dom('[data-test-ak-checkbox-tree-nodeCheckbox]').doesNotExist();
        assert.dom('[data-test-serviceAccountSection-footer]').doesNotExist();

        await click('[data-test-serviceAccountSection-selectScope-actionBtn]');

        assert
          .dom('[data-test-serviceAccountSection-selectScope-actionBtn]')
          .doesNotExist();

        assert
          .dom('[data-test-serviceAccountSection-title]')
          .hasText(t('selectScope'));

        assert.dom('[data-test-ak-checkbox-tree-nodeCheckbox]').exists();
        assert.dom('[data-test-serviceAccountSection-footer]').exists();

        assert
          .dom('[data-test-serviceAccountSection-selectScope-updateBtn]')
          .isNotDisabled()
          .hasText(t('update'));

        assert
          .dom('[data-test-serviceAccountSection-selectScope-cancelBtn]')
          .isNotDisabled()
          .hasText(t('cancel'));

        let parentContainer = find(
          '[data-test-ak-checkbox-tree-nodeKey="public-api"]'
        );

        if (clickParent) {
          await click(
            parentContainer.querySelector(
              '[data-test-ak-checkbox-tree-nodeCheckbox]'
            )
          );
        } else {
          for (const scope of scopeDetails()) {
            const container = find(
              `[data-test-ak-checkbox-tree-nodeKey="${scope.key}"]`
            );

            const checkbox = container.querySelector(
              '[data-test-ak-checkbox-tree-nodeCheckbox]'
            );

            assert
              .dom(checkbox)
              [
                this.serviceAccount[scope.scopeKey]
                  ? 'isChecked'
                  : 'isNotChecked'
              ]();

            if (scope.scopeKey in values) {
              await click(checkbox);
            }
          }
        }

        await click('[data-test-serviceAccountSection-selectScope-updateBtn]');

        const notify = this.owner.lookup('service:notifications');

        if (fail) {
          assert.strictEqual(notify.errorMsg, 'Update failed');

          assert
            .dom('[data-test-serviceAccountSection-title]')
            .hasText(t('selectScope'));

          assert.dom('[data-test-ak-checkbox-tree-nodeCheckbox]').exists();
          assert.dom('[data-test-serviceAccountSection-footer]').exists();

          assert
            .dom('[data-test-serviceAccountSection-selectScope-updateBtn]')
            .isNotDisabled()
            .hasText(t('update'));

          assert
            .dom('[data-test-serviceAccountSection-selectScope-cancelBtn]')
            .isNotDisabled()
            .hasText(t('cancel'));
        } else {
          assert.strictEqual(
            notify.successMsg,
            t('serviceAccountModule.editSuccessMsg')
          );

          assert
            .dom('[data-test-serviceAccountSection-title]')
            .hasText(t('selectedScope'));

          assert
            .dom('[data-test-ak-checkbox-tree-nodeCheckbox]')
            .doesNotExist();

          assert.dom('[data-test-serviceAccountSection-footer]').doesNotExist();

          // refresh parent container reference
          parentContainer = find(
            '[data-test-ak-checkbox-tree-nodeKey="public-api"]'
          );

          assert
            .dom(
              `[data-test-serviceAccountSection-selectScope-nodeLabelIcon="${parentChecked ? 'checked' : 'unchecked'}"]`,
              parentContainer
            )
            .exists();

          for (const scope of scopeDetails()) {
            const container = find(
              `[data-test-ak-checkbox-tree-nodeKey="${scope.key}"]`
            );

            if (values[scope.scopeKey] || parentChecked) {
              assert
                .dom(
                  '[data-test-serviceAccountSection-selectScope-nodeLabelIcon="checked"]',
                  container
                )
                .exists();
            } else {
              assert
                .dom(
                  '[data-test-serviceAccountSection-selectScope-nodeLabelIcon="unchecked"]',
                  container
                )
                .exists();
            }
          }
        }
      }
    );
  }
);
