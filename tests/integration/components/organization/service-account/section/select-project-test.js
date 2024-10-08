import { click, findAll, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { Response } from 'miragejs';
import Service from '@ember/service';
import { selectChoose } from 'ember-power-select/test-support';

import styles from 'irene/components/ak-select/index.scss';

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

const classes = {
  trigger: styles['ak-select-trigger'],
};

const projectAccessOptions = () => [
  { label: t('allProjects'), value: true },
  { label: t('serviceAccountModule.forSpecificProjects'), value: false },
];

module(
  'Integration | Component | organization/service-account/section/select-project',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    hooks.beforeEach(async function () {
      const store = this.owner.lookup('service:store');

      const serviceAccount = this.server.create('service-account');

      const serviceAccountProjects = this.server.createList(
        'service-account-project',
        3,
        { service_account: serviceAccount.id }
      );

      const projects = serviceAccountProjects.forEach((project) => {
        this.server.create('project', { id: project.id });
      });

      const normalized = store.normalize(
        'service-account',
        serviceAccount.toJSON()
      );

      this.owner.register('service:notifications', NotificationsStub);

      this.setProperties({
        serviceAccount: store.push(normalized),
        serviceAccountProjects,
        projects,
        store,
      });
    });

    test.each(
      'it renders',
      [
        { allProjects: true },
        { allProjects: false, hasProjects: true },
        { allProjects: false, hasProjects: false },
      ],
      async function (assert, { allProjects, hasProjects }) {
        this.serviceAccount.allProjects = allProjects;

        this.server.get(
          '/service_accounts/:id/service_account_projects',
          (schema) => {
            const results = hasProjects
              ? schema.serviceAccountProjects.all().models
              : [];

            return {
              count: results.length,
              next: null,
              previous: null,
              results,
            };
          }
        );

        this.server.get('/v2/projects/:id', (schema, req) => {
          return schema.projects.find(req.params.id).toJSON();
        });

        await render(hbs`<Organization::ServiceAccount::Section::SelectProject
          @serviceAccount={{this.serviceAccount}}
        />`);

        assert
          .dom('[data-test-serviceAccountSection-title]')
          .hasText(t('selectedProject'));

        assert
          .dom('[data-test-serviceAccountSection-selectProject-actionBtn]')
          .isNotDisabled();

        assert
          .dom(
            '[data-test-serviceAccountSection-selectProject-projectAccessLabel]'
          )
          .hasText(t('serviceAccountModule.projectAccess'));

        assert
          .dom(
            '[data-test-serviceAccountSection-selectProject-projectAccessInfoIcon]'
          )
          .exists();

        const selectedProjectAccess = projectAccessOptions().find(
          (opt) => opt.value === this.serviceAccount.allProjects
        );

        assert
          .dom(
            '[data-test-serviceAccountSection-selectProject-selectedProjectAccess]'
          )
          .hasText(
            t('serviceAccountModule.selectedProjectAccess', {
              projectAccess: selectedProjectAccess?.label,
            })
          );

        if (allProjects) {
          assert
            .dom(
              '[data-test-serviceAccountSection-selectProjectList-container]'
            )
            .doesNotExist();
        } else {
          if (hasProjects) {
            assert
              .dom('[data-test-serviceAccountSection-selectProjectList-title]')
              .hasText(t('serviceAccountModule.selectedProjectListTitle'));

            assert
              .dom(
                '[data-test-serviceAccountSection-selectProjectList-description]'
              )
              .hasText(
                t('serviceAccountModule.selectedProjectListDescription')
              );

            assert
              .dom(
                '[data-test-serviceAccountSection-selectProjectList-addProjectBtn]'
              )
              .doesNotExist();

            const listItems = findAll(
              '[data-test-serviceAccountSection-selectProjectList-item]'
            );

            assert.strictEqual(
              listItems.length,
              this.serviceAccountProjects.length
            );

            // assert first row
            const serviceAccountProject = this.store.peekRecord(
              'service-account-project',
              this.serviceAccountProjects[0].id
            );

            assert
              .dom(
                `[data-test-serviceAccountSection-selectProjectList-platformIcon="${serviceAccountProject.project.get('platformIconClass')}"]`,
                listItems[0]
              )
              .exists();

            assert
              .dom(
                '[data-test-serviceAccountSection-selectProjectList-projectName]',
                listItems[0]
              )
              .hasText(serviceAccountProject.project.get('packageName'));

            assert
              .dom(
                '[data-test-serviceAccountSection-selectProjectList-removeBtn]'
              )
              .doesNotExist();
          } else {
            assert
              .dom(
                '[data-test-serviceAccountSection-selectProjectList-container]'
              )
              .exists();

            assert
              .dom(
                '[data-test-serviceAccountSection-selectProjectList-emptySvg]'
              )
              .exists();

            assert
              .dom(
                '[data-test-serviceAccountSection-selectProjectList-emptyTitle]'
              )
              .hasText(t('serviceAccountModule.emptyProjectListTitle'));

            assert
              .dom(
                '[data-test-serviceAccountSection-selectProjectList-emptyDescription]'
              )
              .hasText(t('serviceAccountModule.emptyProjectListDescription'));

            assert
              .dom(
                '[data-test-serviceAccountSection-selectProjectList-emptyAddProjectBtn]'
              )
              .isNotDisabled()
              .hasText(t('addProject'));
          }
        }

        assert.dom('[data-test-serviceAccountSection-footer]').doesNotExist();
      }
    );

    test.each(
      'it should update project access type',
      [false, true],
      async function (assert, fail) {
        this.server.get(
          '/service_accounts/:id/service_account_projects',
          () => {
            return { count: 0, next: null, previous: null, results: [] };
          }
        );

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

        await render(hbs`<Organization::ServiceAccount::Section::SelectProject
          @serviceAccount={{this.serviceAccount}}
        />`);

        assert
          .dom('[data-test-serviceAccountSection-title]')
          .hasText(t('selectedProject'));

        assert
          .dom('[data-test-serviceAccountSection-selectProject-actionBtn]')
          .isNotDisabled();

        assert
          .dom(
            '[data-test-serviceAccountSection-selectProject-projectAccessLabel]'
          )
          .hasText(t('serviceAccountModule.projectAccess'));

        assert
          .dom(
            '[data-test-serviceAccountSection-selectProject-projectAccessInfoIcon]'
          )
          .exists();

        const selectedProjectAccess = projectAccessOptions().find(
          (opt) => opt.value === this.serviceAccount.allProjects
        );

        assert
          .dom(
            '[data-test-serviceAccountSection-selectProject-selectedProjectAccess]'
          )
          .hasText(
            t('serviceAccountModule.selectedProjectAccess', {
              projectAccess: selectedProjectAccess?.label,
            })
          );

        assert.dom('[data-test-serviceAccountSection-footer]').doesNotExist();

        await click(
          '[data-test-serviceAccountSection-selectProject-actionBtn]'
        );

        assert
          .dom('[data-test-serviceAccountSection-selectProject-actionBtn]')
          .doesNotExist();

        assert
          .dom(
            '[data-test-serviceAccountSection-selectProject-projectAccessSelect]'
          )
          .exists();

        assert.dom('[data-test-serviceAccountSection-footer]').exists();

        assert
          .dom('[data-test-serviceAccountSection-selectProject-updateBtn]')
          .isNotDisabled()
          .hasText(t('update'));

        assert
          .dom('[data-test-serviceAccountSection-selectProject-cancelBtn]')
          .isNotDisabled()
          .hasText(t('cancel'));

        const optionToSelect = projectAccessOptions().find(
          (opt) => opt.value !== selectedProjectAccess.value
        );

        await selectChoose(
          `[data-test-serviceAccountSection-selectProject-projectAccessSelect] .${classes.trigger}`,
          optionToSelect.label
        );

        await click(
          '[data-test-serviceAccountSection-selectProject-updateBtn]'
        );

        const notify = this.owner.lookup('service:notifications');

        if (fail) {
          assert.strictEqual(notify.errorMsg, 'Update failed');

          assert
            .dom(
              '[data-test-serviceAccountSection-selectProject-projectAccessSelect]'
            )
            .exists();

          assert.dom('[data-test-serviceAccountSection-footer]').exists();

          assert
            .dom('[data-test-serviceAccountSection-selectProject-updateBtn]')
            .isNotDisabled()
            .hasText(t('update'));

          assert
            .dom('[data-test-serviceAccountSection-selectProject-cancelBtn]')
            .isNotDisabled()
            .hasText(t('cancel'));
        } else {
          assert.strictEqual(
            notify.successMsg,
            t('serviceAccountModule.editSuccessMsg')
          );

          assert
            .dom(
              '[data-test-serviceAccountSection-selectProject-selectedProjectAccess]'
            )
            .hasText(
              t('serviceAccountModule.selectedProjectAccess', {
                projectAccess: optionToSelect?.label,
              })
            );

          assert
            .dom('[data-test-serviceAccountSection-selectProject-actionBtn]')
            .isNotDisabled();

          assert.dom('[data-test-serviceAccountSection-footer]').doesNotExist();
        }
      }
    );

    test.each(
      'it should add project to service account',
      [{ hasProjects: true }, { hasProjects: false }],
      async function (assert, { hasProjects }) {
        this.serviceAccount.updateValues({
          all_projects: false,
        });

        if (!hasProjects) {
          this.server.db.serviceAccountProjects.remove();
        }

        // create some projects
        const createExcludedProjects = () =>
          this.server.createList('project', 6);

        this.server.get(
          '/service_accounts/:id/service_account_projects',
          (schema) => {
            const results = schema.serviceAccountProjects.all().models;

            return {
              count: results.length,
              next: null,
              previous: null,
              results,
            };
          }
        );

        this.server.post(
          '/service_accounts/:id/service_account_projects',
          (schema, req) => {
            const data = JSON.parse(req.requestBody);

            return schema.serviceAccountProjects
              .create({
                service_account: req.params.id,
                project: data.project_id,
              })
              .toJSON();
          }
        );

        this.server.get('/service_accounts/:id/excluded_projects', () => {
          const results = createExcludedProjects();

          return { count: results.length, next: null, previous: null, results };
        });

        this.server.get('/v2/projects/:id', (schema, req) => {
          return schema.projects.find(req.params.id).toJSON();
        });

        await render(hbs`<Organization::ServiceAccount::Section::SelectProject
          @serviceAccount={{this.serviceAccount}}
        />`);

        assert
          .dom('[data-test-serviceAccountSection-title]')
          .hasText(t('selectedProject'));

        assert
          .dom('[data-test-serviceAccountSection-selectProject-actionBtn]')
          .isNotDisabled();

        assert
          .dom('[data-test-serviceAccountAddProject-drawerContainer]')
          .doesNotExist();

        if (hasProjects) {
          await click(
            '[data-test-serviceAccountSection-selectProject-actionBtn]'
          );

          assert
            .dom('[data-test-serviceAccountSection-selectProjectList-title]')
            .hasText(t('serviceAccountModule.selectedProjectListTitle'));

          assert
            .dom(
              '[data-test-serviceAccountSection-selectProjectList-addProjectBtn]'
            )
            .isNotDisabled()
            .hasText(t('addProject'));

          await click(
            '[data-test-serviceAccountSection-selectProjectList-addProjectBtn]'
          );
        } else {
          assert
            .dom(
              '[data-test-serviceAccountSection-selectProjectList-emptyAddProjectBtn]'
            )
            .isNotDisabled()
            .hasText(t('addProject'));

          await click(
            '[data-test-serviceAccountSection-selectProjectList-emptyAddProjectBtn]'
          );
        }

        assert
          .dom('[data-test-serviceAccountAddProject-drawerContainer]')
          .exists();

        assert
          .dom('[data-test-serviceAccountAddProject-drawerTitle]')
          .hasText(t('addProject'));

        assert
          .dom('[data-test-serviceAccountAddProject-drawerCloseBtn]')
          .isNotDisabled();

        assert
          .dom('[data-test-serviceAccountAddProjectList-title]')
          .hasText(t('addProject'));

        assert
          .dom('[data-test-serviceAccountAddProjectList-description]')
          .hasText(t('serviceAccountModule.addProjectDescription'));

        assert
          .dom('[data-test-serviceAccountAddProjectList-searchInput]')
          .isNotDisabled();

        const headers = findAll(
          '[data-test-serviceAccountAddProjectList-thead] th'
        );

        assert.strictEqual(headers.length, 2);

        assert.dom(headers[0]).hasText(t('name'));
        assert.dom(headers[1]).hasText(t('action'));

        const rows = findAll('[data-test-serviceAccountAddProjectList-row]');

        assert.strictEqual(rows.length, 6);

        assert
          .dom('[data-test-serviceAccountAddProjectList-cancelBtn]')
          .isNotDisabled();

        assert
          .dom('[data-test-serviceAccountAddProjectList-addBtn]')
          .isDisabled();

        // select 3 projects
        await click(rows[0].querySelector('[data-test-checkbox]'));
        await click(rows[2].querySelector('[data-test-checkbox]'));
        await click(rows[3].querySelector('[data-test-checkbox]'));

        assert
          .dom('[data-test-serviceAccountAddProjectList-addBtn]')
          .isNotDisabled();

        await click('[data-test-serviceAccountAddProjectList-addBtn]');

        const notify = this.owner.lookup('service:notifications');

        assert.strictEqual(
          notify.successMsg,
          t('serviceAccountModule.addProjectSuccessMsg')
        );

        assert
          .dom('[data-test-serviceAccountAddProject-drawerContainer]')
          .doesNotExist();

        const listItems = findAll(
          '[data-test-serviceAccountSection-selectProjectList-item]'
        );

        assert.strictEqual(
          listItems.length,
          hasProjects ? this.serviceAccountProjects.length + 3 : 3
        );
      }
    );

    test.each(
      'it should remove project from service account',
      [false, true],
      async function (assert, fail) {
        this.serviceAccount.updateValues({
          all_projects: false,
        });

        this.server.get(
          '/service_accounts/:id/service_account_projects',
          (schema) => {
            const results = schema.serviceAccountProjects.all().models;

            return {
              count: results.length,
              next: null,
              previous: null,
              results,
            };
          }
        );

        this.server.get('/v2/projects/:id', (schema, req) => {
          return schema.projects.find(req.params.id).toJSON();
        });

        this.server.delete('/service_account_projects/:id', (schema, req) => {
          if (fail) {
            return new Response(502, {}, { detail: 'Project remove failed' });
          }

          return schema.db.serviceAccountProjects.remove(req.params.id);
        });

        await render(hbs`<Organization::ServiceAccount::Section::SelectProject
          @serviceAccount={{this.serviceAccount}}
        />`);

        assert
          .dom('[data-test-serviceAccountSection-title]')
          .hasText(t('selectedProject'));

        assert
          .dom('[data-test-serviceAccountSection-selectProject-actionBtn]')
          .isNotDisabled();

        assert
          .dom('[data-test-serviceAccountSection-selectProjectList-title]')
          .hasText(t('serviceAccountModule.selectedProjectListTitle'));

        assert
          .dom(
            '[data-test-serviceAccountSection-selectProjectList-description]'
          )
          .hasText(t('serviceAccountModule.selectedProjectListDescription'));

        const listItems = findAll(
          '[data-test-serviceAccountSection-selectProjectList-item]'
        );

        assert.strictEqual(
          listItems.length,
          this.serviceAccountProjects.length
        );

        assert
          .dom('[data-test-serviceAccountSection-selectProjectList-removeBtn]')
          .doesNotExist();

        await click(
          '[data-test-serviceAccountSection-selectProject-actionBtn]'
        );

        assert
          .dom('[data-test-serviceAccountSection-selectProjectList-removeBtn]')
          .exists({ count: this.serviceAccountProjects.length });

        await click(
          listItems[0].querySelector(
            '[data-test-serviceAccountSection-selectProjectList-removeBtn]'
          )
        );

        assert
          .dom('[data-test-serviceAccount-confirmDrawer-heading]')
          .hasText(t('confirmation'));

        const serviceAccountProject = this.store.peekRecord(
          'service-account-project',
          this.serviceAccountProjects[0].id
        );

        assert
          .dom('[data-test-serviceAccount-confirmDrawer-removeConfirmText]')
          .hasText(
            t('serviceAccountModule.removeProjectConfirmText', {
              projectName: serviceAccountProject.project.get('packageName'),
            })
          );

        assert
          .dom('[data-test-serviceAccount-confirmDrawer-confirmBtn]')
          .isNotDisabled()
          .hasText(t('remove'));

        assert
          .dom('[data-test-serviceAccount-confirmDrawer-cancelBtn]')
          .isNotDisabled()
          .hasText(t('cancel'));

        await click('[data-test-serviceAccount-confirmDrawer-confirmBtn]');

        const notify = this.owner.lookup('service:notifications');

        if (fail) {
          assert.strictEqual(notify.errorMsg, 'Project remove failed');

          assert
            .dom('[data-test-serviceAccount-confirmDrawer-heading]')
            .hasText(t('confirmation'));

          assert
            .dom('[data-test-serviceAccount-confirmDrawer-confirmBtn]')
            .isNotDisabled()
            .hasText(t('remove'));

          assert
            .dom('[data-test-serviceAccount-confirmDrawer-cancelBtn]')
            .isNotDisabled()
            .hasText(t('cancel'));
        } else {
          assert.strictEqual(
            notify.successMsg,
            t('serviceAccountModule.removeProjectSuccessMsg')
          );

          assert
            .dom('[data-test-serviceAccount-confirmDrawer-heading]')
            .doesNotExist();

          assert.strictEqual(
            findAll('[data-test-serviceAccountSection-selectProjectList-item]')
              .length,
            this.serviceAccountProjects.length - 1
          );
        }
      }
    );
  }
);
