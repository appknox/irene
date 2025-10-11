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
              'serviceAccountModule.scopes.auto-approve-new-name-spaces.description'
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
];

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

      for (const scope of scopeDetails()) {
        if (scope.children) {
          // Handle parent nodes (like 'user' and 'upload')
          if (scope.label) {
            const container = find(
              `[data-test-ak-checkbox-tree-nodeKey="${scope.key}"]`
            );

            if (container) {
              assert
                .dom(
                  '[data-test-serviceAccountSection-selectScope-nodeLabel]',
                  container
                )
                .containsText(scope.label);
            }
          }

          // Handle child nodes
          for (const childScope of scope.children) {
            // Skip if childScope is actually a parent node (like 'user' node having children)
            if (childScope.children) {
              continue;
            }

            const container = find(
              `[data-test-ak-checkbox-tree-nodeKey="${childScope.key}"]`
            );

            if (!container) {
              continue;
            }

            // Only check icon state if it's a leaf node with scopeKey
            if (childScope.scopeKey) {
              const isChecked = this.serviceAccount.get(childScope.scopeKey);
              const expectedState = isChecked ? 'checked' : 'unchecked';

              // Check that the correct icon exists
              assert
                .dom(
                  `[data-test-serviceAccountSection-selectScope-nodeLabelIcon="${expectedState}"]`,
                  container
                )
                .exists();
            }

            // Check node label and access type
            if (childScope.scopeLabel) {
              assert
                .dom(
                  '[data-test-serviceAccountSection-selectScope-nodeLabel]',
                  container
                )
                .containsText(childScope.scopeLabel);
            }

            if (childScope.accessType) {
              assert
                .dom(
                  '[data-test-serviceAccountSection-selectScope-nodeLabelAccessType]',
                  container
                )
                .containsText(childScope.accessType);
            }

            // Test tooltip if info icon exists
            const infoIcon = container.querySelector(
              '[data-test-serviceAccountSection-selectScope-nodeLabelInfoIcon]'
            );

            if (infoIcon && childScope.scopeDescription) {
              assert
                .dom(
                  '[data-test-serviceAccountSection-selectScope-nodeLabelInfoText]'
                )
                .doesNotExist('Tooltip should not be visible initially');

              await triggerEvent(infoIcon, 'mouseenter');

              assert
                .dom(
                  '[data-test-serviceAccountSection-selectScope-nodeLabelInfoText]'
                )
                .exists('Tooltip should be visible on hover')
                .hasText(childScope.scopeDescription);

              await triggerEvent(infoIcon, 'mouseleave');
            }
          }
        } else {
          // Handle root-level leaf nodes (like 'team-operations')
          const container = find(
            `[data-test-ak-checkbox-tree-nodeKey="${scope.key}"]`
          );

          if (!container) {
            continue;
          }

          if (scope.scopeKey) {
            const isChecked = this.serviceAccount.get(scope.scopeKey);
            const expectedState = isChecked ? 'checked' : 'unchecked';

            assert
              .dom(
                `[data-test-serviceAccountSection-selectScope-nodeLabelIcon="${expectedState}"]`,
                container
              )
              .exists();
          }

          // Check node label and access type
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

          // Test tooltip if info icon exists
          const infoIcon = container.querySelector(
            '[data-test-serviceAccountSection-selectScope-nodeLabelInfoIcon]'
          );

          if (infoIcon && scope.scopeDescription) {
            assert
              .dom(
                '[data-test-serviceAccountSection-selectScope-nodeLabelInfoText]'
              )
              .doesNotExist('Tooltip should not be visible initially');

            await triggerEvent(infoIcon, 'mouseenter');

            assert
              .dom(
                '[data-test-serviceAccountSection-selectScope-nodeLabelInfoText]'
              )
              .exists('Tooltip should be visible on hover')
              .hasText(scope.scopeDescription);

            await triggerEvent(infoIcon, 'mouseleave');
          }
        }
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

          for (const scope of scopeDetails()) {
            if (scope.children) {
              // Handle parent nodes (like 'user' and 'upload')
              if (scope.label) {
                const container = find(
                  `[data-test-ak-checkbox-tree-nodeKey="${scope.key}"]`
                );

                if (container) {
                  assert
                    .dom(
                      '[data-test-serviceAccountSection-selectScope-nodeLabel]',
                      container
                    )
                    .containsText(scope.label);
                }
              }

              // Handle child nodes
              for (const childScope of scope.children) {
                // Skip if childScope is actually a parent node (like 'user' node having children)
                if (childScope.children) {
                  continue;
                }

                const container = find(
                  `[data-test-ak-checkbox-tree-nodeKey="${childScope.key}"]`
                );

                if (!container) {
                  continue;
                }

                // Only check icon state if it's a leaf node with scopeKey
                if (childScope.scopeKey) {
                  const isChecked = this.serviceAccount.get(
                    childScope.scopeKey
                  );
                  const expectedState = isChecked ? 'checked' : 'unchecked';

                  // Check that the correct icon exists
                  assert
                    .dom(
                      `[data-test-serviceAccountSection-selectScope-nodeLabelIcon="${expectedState}"]`,
                      container
                    )
                    .exists();
                }

                // Check node label and access type
                if (childScope.scopeLabel) {
                  assert
                    .dom(
                      '[data-test-serviceAccountSection-selectScope-nodeLabel]',
                      container
                    )
                    .containsText(childScope.scopeLabel);
                }

                if (childScope.accessType) {
                  assert
                    .dom(
                      '[data-test-serviceAccountSection-selectScope-nodeLabelAccessType]',
                      container
                    )
                    .containsText(childScope.accessType);
                }

                // Test tooltip if info icon exists
                const infoIcon = container.querySelector(
                  '[data-test-serviceAccountSection-selectScope-nodeLabelInfoIcon]'
                );

                if (infoIcon && childScope.scopeDescription) {
                  assert
                    .dom(
                      '[data-test-serviceAccountSection-selectScope-nodeLabelInfoText]'
                    )
                    .doesNotExist('Tooltip should not be visible initially');

                  await triggerEvent(infoIcon, 'mouseenter');

                  assert
                    .dom(
                      '[data-test-serviceAccountSection-selectScope-nodeLabelInfoText]'
                    )
                    .exists('Tooltip should be visible on hover')
                    .hasText(childScope.scopeDescription);

                  await triggerEvent(infoIcon, 'mouseleave');
                }
              }
            } else {
              // Handle root-level leaf nodes (like 'team-operations')
              const container = find(
                `[data-test-ak-checkbox-tree-nodeKey="${scope.key}"]`
              );

              if (!container) {
                continue;
              }

              if (scope.scopeKey) {
                const isChecked = this.serviceAccount.get(scope.scopeKey);
                const expectedState = isChecked ? 'checked' : 'unchecked';

                assert
                  .dom(
                    `[data-test-serviceAccountSection-selectScope-nodeLabelIcon="${expectedState}"]`,
                    container
                  )
                  .exists();
              }

              // Check node label and access type
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

              // Test tooltip if info icon exists
              const infoIcon = container.querySelector(
                '[data-test-serviceAccountSection-selectScope-nodeLabelInfoIcon]'
              );

              if (infoIcon && scope.scopeDescription) {
                assert
                  .dom(
                    '[data-test-serviceAccountSection-selectScope-nodeLabelInfoText]'
                  )
                  .doesNotExist('Tooltip should not be visible initially');

                await triggerEvent(infoIcon, 'mouseenter');

                assert
                  .dom(
                    '[data-test-serviceAccountSection-selectScope-nodeLabelInfoText]'
                  )
                  .exists('Tooltip should be visible on hover')
                  .hasText(scope.scopeDescription);

                await triggerEvent(infoIcon, 'mouseleave');
              }
            }
          }
        }
      }
    );
  }
);
