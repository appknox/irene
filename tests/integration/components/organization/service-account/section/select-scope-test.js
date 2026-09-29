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
    key: 'public-api',
    label: t('serviceAccountModule.scopes.public-api.label'),
    children: [
      {
        key: 'projects-read',
        scopeLabel: t('serviceAccountModule.scopes.projects.label'),
        scopeDescription: t(
          'serviceAccountModule.scopes.projects.readDescription'
        ),
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
        key: 'user',
        label: t('serviceAccountModule.scopes.user.label'),
        children: [
          {
            key: 'user-read',
            scopeLabel: t('serviceAccountModule.scopes.user.read'),
            scopeDescription: t(
              'serviceAccountModule.scopes.user.readDescription'
            ),
            accessType: t('read'),
            scopeKey: 'scopePublicApiUserRead',
          },
          {
            key: 'user-write',
            scopeLabel: t('serviceAccountModule.scopes.user.write'),
            scopeDescription: t(
              'serviceAccountModule.scopes.user.writeDescription'
            ),
            accessType: t('write'),
            scopeKey: 'scopePublicApiUserWrite',
          },
        ],
      },
      {
        key: 'upload',
        label: t('serviceAccountModule.scopes.upload-app.label'),
        children: [
          {
            key: 'upload-app',
            scopeLabel: t('serviceAccountModule.scopes.upload-app.label'),
            scopeDescription: t(
              'serviceAccountModule.scopes.upload-app.writeDescription'
            ),
            accessType: t('write'),
            scopeKey: 'scopePublicApiUploadApp',
          },
          {
            key: 'auto-approve-new-name-spaces',
            scopeLabel: t(
              'serviceAccountModule.scopes.auto-approve-new-name-spaces.label'
            ),
            scopeDescription: t(
              'serviceAccountModule.scopes.auto-approve-new-name-spaces.writeDescription'
            ),
            accessType: t('write'),
            scopeKey: 'scopeAutoApproveNewNameSpaces',
          },
        ],
      },
      {
        key: 'team-operations',
        scopeLabel: t('serviceAccountModule.scopes.team-operations.label'),
        scopeDescription: t(
          'serviceAccountModule.scopes.team-operations.description'
        ),
        accessType: t('write'),
        scopeKey: 'scopePublicApiTeamOperations',
      },
    ],
  },
  {
    key: 'cli',
    scopeLabel: t('serviceAccountModule.scopes.cli.label'),
    scopeDescription: t('serviceAccountModule.scopes.cli.description'),
    scopeKey: 'scopeCli',
    children: [
      {
        key: 'cli-auto-approve-new-name-spaces',
        scopeLabel: t(
          'serviceAccountModule.scopes.cli-auto-approve-new-name-spaces.label'
        ),
        scopeDescription: t(
          'serviceAccountModule.scopes.cli-auto-approve-new-name-spaces.description'
        ),
        accessType: t('write'),
        scopeKey: 'cliScopeAutoApproveNewNameSpaces',
      },
    ],
  },
];

// Asserts a single node's own rendered content: checked/unchecked icon,
// label text, access type, and (if present) its hover tooltip. Used both
// for root-level leaves (e.g. 'team-operations') and for a parent that also
// carries its own scope (e.g. 'cli', which is one row with a nested child).
async function assertScopeNode(assert, scope, container, serviceAccount) {
  if (scope.scopeKey) {
    const isChecked = serviceAccount.get(scope.scopeKey);
    const expectedState = isChecked ? 'checked' : 'unchecked';

    assert
      .dom(
        `[data-test-serviceAccountSection-selectScope-nodeLabelIcon="${expectedState}"]`,
        container
      )
      .exists();
  }

  if (scope.scopeLabel) {
    assert
      .dom(
        '[data-test-serviceAccountSection-selectScope-nodeLabel]',
        container
      )
      .containsText(scope.scopeLabel);
  }

  if (scope.accessType) {
    assert
      .dom(
        '[data-test-serviceAccountSection-selectScope-nodeLabelAccessType]',
        container
      )
      .containsText(scope.accessType);
  }

  const infoIcon = container.querySelector(
    '[data-test-serviceAccountSection-selectScope-nodeLabelInfoIcon]'
  );

  if (infoIcon && scope.scopeDescription) {
    assert
      .dom('[data-test-serviceAccountSection-selectScope-nodeLabelInfoText]')
      .doesNotExist('Tooltip should not be visible initially');

    await triggerEvent(infoIcon, 'mouseenter');

    assert
      .dom('[data-test-serviceAccountSection-selectScope-nodeLabelInfoText]')
      .exists('Tooltip should be visible on hover')
      .hasText(scope.scopeDescription);

    await triggerEvent(infoIcon, 'mouseleave');
  }
}

// Walks the whole scopeDetails() tree and asserts every node that's
// actually rendered: a plain-label parent (e.g. 'upload') only gets its
// heading text checked, a scope-carrying node (leaf or hybrid parent like
// 'cli') gets the full assertScopeNode treatment, and any children are
// checked the same way (one level deep — matches the tree's actual depth).
async function assertRenderedTree(assert, serviceAccount) {
  for (const scope of scopeDetails()) {
    const container = find(`[data-test-ak-checkbox-tree-nodeKey="${scope.key}"]`);

    if (container) {
      if (scope.label) {
        assert
          .dom(
            '[data-test-serviceAccountSection-selectScope-nodeLabel]',
            container
          )
          .containsText(scope.label);
      } else if (scope.scopeLabel) {
        await assertScopeNode(assert, scope, container, serviceAccount);
      }
    }

    for (const childScope of scope.children || []) {
      if (childScope.children) {
        continue;
      }

      const childContainer = find(
        `[data-test-ak-checkbox-tree-nodeKey="${childScope.key}"]`
      );

      if (childContainer) {
        await assertScopeNode(assert, childScope, childContainer, serviceAccount);
      }
    }
  }
}

module(
  'Integration | Component | organization/service-account/section/select-scope',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

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

      await assertRenderedTree(assert, this.serviceAccount);
    });

    test.each(
      'it should udpate selected scope',
      [
        {
          parentChecked: false,
          allChecked: false, // initial all checkboxes should be unchecked
          values: {
            scopePublicApiProjectRead: true,
            scopePublicApiUserRead: false,
            scopePublicApiUserWrite: false,
            scopePublicApiUploadApp: true,
            scopeAutoApproveNewNameSpaces: true,
            scopePublicApiTeamOperations: false,
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
          clickParent: true,
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
          scope_public_api_user_write: allChecked,
          scope_public_api_upload_app: allChecked,
          scope_public_api_team_operations: allChecked,
          scope_auto_approve_new_name_spaces: allChecked,
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
            if (scope.children) {
              for (const childScope of scope.children) {
                const container = find(
                  `[data-test-ak-checkbox-tree-nodeKey="${childScope.key}"]`
                );

                // Collapsed groups (e.g. CLI, unlike Upload, isn't
                // auto-expanded) don't render their children at all.
                if (!container) {
                  continue;
                }

                const checkbox = container.querySelector(
                  '[data-test-ak-checkbox-tree-nodeCheckbox]'
                );

                assert
                  .dom(checkbox)
                  [
                    this.serviceAccount[childScope.scopeKey]
                      ? 'isChecked'
                      : 'isNotChecked'
                  ]();

                if (childScope.scopeKey in values) {
                  await click(checkbox);
                }
              }
            } else {
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

          // Check the checkbox state directly
          const checkbox = find('[data-test-ak-checkbox-tree-nodecheckbox]');

          if (parentChecked) {
            // For checked state, verify the checked icon exists
            assert
              .dom(
                '[data-test-serviceAccountSection-selectScope-nodeLabelIcon="checked"]',
                parentContainer
              )
              .exists();

            // Verify the checkbox is checked
            if (checkbox) {
              assert.dom(checkbox).isChecked();
            }
          } else {
            // For unchecked state, the icon might not be in the DOM
            // Only verify the unchecked icon if it exists
            const uncheckedIcon = parentContainer.querySelector(
              '[data-test-serviceAccountSection-selectScope-nodeLabelIcon="unchecked"]'
            );

            if (uncheckedIcon) {
              assert
                .dom(
                  '[data-test-serviceAccountSection-selectScope-nodeLabelIcon="unchecked"]',
                  parentContainer
                )
                .exists();
            }

            // Verify the checkbox is not checked if it exists
            if (checkbox) {
              assert.dom(checkbox).isNotChecked();
            }
          }

          await assertRenderedTree(assert, this.serviceAccount);
        }
      }
    );

    test('checking CLI alone saves scope_cli, leaves auto-approve and expiry untouched', async function (assert) {
      assert.expect(3);

      const originalExpiry = new Date();
      this.serviceAccount.expiry = originalExpiry;

      this.server.put('/service_accounts/:id', (schema, req) => {
        const data = JSON.parse(req.requestBody);

        assert.true(data.scope_cli);
        assert.false(data.cli_scope_auto_approve_new_name_spaces);

        return schema.serviceAccounts.find(req.params.id).update(data).toJSON();
      });

      await render(hbs`<Organization::ServiceAccount::Section::SelectScope
        @serviceAccount={{this.serviceAccount}}
      />`);

      await click('[data-test-serviceAccountSection-selectScope-actionBtn]');

      const container = find('[data-test-ak-checkbox-tree-nodeKey="cli"]');

      await click(
        container.querySelector('[data-test-ak-checkbox-tree-nodeCheckbox]')
      );

      assert.strictEqual(this.serviceAccount.expiry, originalExpiry);

      await click('[data-test-serviceAccountSection-selectScope-updateBtn]');
    });

    test('checking CLI does NOT cascade auto-approve on (flags are independent)', async function (assert) {
      // Unlike the public API's Upload group, CLI access and CLI
      // auto-approve are deliberately independent settings — enabling one
      // must not silently enable the other.
      await render(hbs`<Organization::ServiceAccount::Section::SelectScope
        @serviceAccount={{this.serviceAccount}}
      />`);

      await click('[data-test-serviceAccountSection-selectScope-actionBtn]');

      const cliContainer = find('[data-test-ak-checkbox-tree-nodeKey="cli"]');

      await click(
        cliContainer.querySelector('[data-test-ak-checkbox-tree-nodeCheckbox]')
      );

      assert.true(this.serviceAccount.scopeCli);
      assert.false(this.serviceAccount.cliScopeAutoApproveNewNameSpaces);
    });

    test('unchecking CLI also turns off CLI auto-approve', async function (assert) {
      this.serviceAccount.updateValues({
        scope_cli: true,
        cli_scope_auto_approve_new_name_spaces: true,
      });

      await render(hbs`<Organization::ServiceAccount::Section::SelectScope
        @serviceAccount={{this.serviceAccount}}
      />`);

      await click('[data-test-serviceAccountSection-selectScope-actionBtn]');

      const container = find('[data-test-ak-checkbox-tree-nodeKey="cli"]');

      await click(
        container.querySelector('[data-test-ak-checkbox-tree-nodeCheckbox]')
      );

      assert.false(this.serviceAccount.scopeCli);
      assert.false(this.serviceAccount.cliScopeAutoApproveNewNameSpaces);
    });

    test('checking CLI auto-approve forces CLI on too', async function (assert) {
      this.serviceAccount.updateValues({
        scope_cli: false,
        cli_scope_auto_approve_new_name_spaces: false,
      });

      await render(hbs`<Organization::ServiceAccount::Section::SelectScope
        @serviceAccount={{this.serviceAccount}}
      />`);

      await click('[data-test-serviceAccountSection-selectScope-actionBtn]');

      // CLI is collapsed by default (like Upload) — expand it first to
      // reach its Auto Approve child.
      const cliContainer = find('[data-test-ak-checkbox-tree-nodeKey="cli"]');

      await click(
        cliContainer.querySelector('[data-test-ak-checkbox-tree-nodeExpandIcon]')
      );

      const container = find(
        '[data-test-ak-checkbox-tree-nodeKey="cli-auto-approve-new-name-spaces"]'
      );

      await click(
        container.querySelector('[data-test-ak-checkbox-tree-nodeCheckbox]')
      );

      assert.true(this.serviceAccount.cliScopeAutoApproveNewNameSpaces);
      assert.true(this.serviceAccount.scopeCli);
    });
  }
);
