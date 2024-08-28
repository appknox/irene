import { module, test } from 'qunit';

import {
  visit,
  find,
  click,
  findAll,
  fillIn,
  currentURL,
} from '@ember/test-helpers';

import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import { underscore } from '@ember/string';
import Service from '@ember/service';
import dayjs from 'dayjs';

import { setupRequiredEndpoints } from '../../helpers/acceptance-utils';
import styles from 'irene/components/ak-select/index.scss';
import { faker } from '@faker-js/faker';

class IntegrationStub extends Service {
  async configure(user) {
    this.currentUser = user;
  }

  isPendoEnabled() {
    return false;
  }

  isCrispEnabled() {
    return false;
  }
}

class WebsocketStub extends Service {
  async connect() {}

  async configure() {}
}

class NotificationsStub extends Service {
  errorMsg = null;
  successMsg = null;

  error(msg) {
    this.errorMsg = msg;
  }

  success(msg) {
    this.successMsg = msg;
  }

  setDefaultAutoClear() {}
}

const classes = {
  trigger: styles['ak-select-trigger'],
};

const scopeDetails = [
  {
    key: 'projects-read',
    scopeLabel: 'serviceAccountModule.scopes.projects.label',
    scopeDescription: 'serviceAccountModule.scopes.projects.readDescription',
    accessType: 'read',
    scopeKey: 'scopePublicApiProjectRead',
  },
  {
    key: 'scan-results-va-read',
    scopeLabel: 'serviceAccountModule.scopes.scan-results-va.label',
    scopeDescription:
      'serviceAccountModule.scopes.scan-results-va.readDescription',
    accessType: 'read',
    scopeKey: 'scopePublicApiScanResultVa',
  },
  {
    key: 'user-read',
    scopeLabel: 'serviceAccountModule.scopes.user.label',
    scopeDescription: 'serviceAccountModule.scopes.user.readDescription',
    accessType: 'read',
    scopeKey: 'scopePublicApiUserRead',
  },
];

const projectAccessOptions = [
  { label: 'allProjects', value: true },
  { label: 'serviceAccountModule.forSpecificProjects', value: false },
];

module('Acceptance | Create service account', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const { organization, currentOrganizationMe } =
      await setupRequiredEndpoints(this.server);

    const [serviceAccount] = this.server.createList('service-account', 2);

    this.owner.register('service:notifications', NotificationsStub);
    this.owner.register('service:integration', IntegrationStub);
    this.owner.register('service:websocket', WebsocketStub);

    this.setProperties({
      serviceAccount,
      organization,
      organizationMe: currentOrganizationMe,
    });
  });

  test.each(
    'it renders',
    [{ duplicate: false }, { duplicate: true }],
    async function (assert, { duplicate }) {
      // feature is enabled
      this.organization.update({
        features: {
          public_apis: true,
        },
      });

      // role set to owner
      this.organizationMe.update({
        is_owner: true,
        is_admin: true,
      });

      const defaultExpiryInDays = 30;

      if (duplicate) {
        this.serviceAccount.update({
          all_projects: false,
          expiry: null,
        });
      }

      const expiryInDate = (days) =>
        dayjs().add(days, 'days').format('MMM DD, YYYY');

      this.server.get('/service_accounts/:id', (schema, req) => {
        return schema.serviceAccounts.find(req.params.id).toJSON();
      });

      await visit(
        '/dashboard/organization/settings/service-account/create'.concat(
          duplicate ? `?duplicate=${this.serviceAccount.id}` : ''
        )
      );

      assert
        .dom('[data-test-serviceAccountCreate-title]')
        .hasText(t('serviceAccountModule.createTitle'));

      assert
        .dom('[data-test-serviceAccountCreate-description]')
        .hasText(t('serviceAccountModule.createDescription'));

      assert
        .dom('[data-test-serviceAccountCreate-cancelLink]')
        .hasText(t('cancel'));

      assert
        .dom('[data-test-serviceAccountCreate-saveButton]')
        .isNotDisabled()
        .hasText(t('save'));

      const sectionHeadings = findAll(
        '[data-test-serviceAccountSection-title]'
      );

      assert.strictEqual(sectionHeadings.length, 4);

      // assert account overview
      assert.dom(sectionHeadings[0]).hasText(t('accountOverview'));

      assert
        .dom('[data-test-serviceAccountSection-accountOverview-actionBtn]')
        .doesNotExist();

      assert
        .dom('[data-test-form-label]')
        .containsText(t('serviceAccountModule.nameOfTheServiceAccount'));

      assert
        .dom('[data-test-serviceAccountSection-accountOverview-auditInfoIcon]')
        .doesNotExist();

      if (duplicate) {
        assert
          .dom('[data-test-serviceAccountSection-accountOverview-nameInput]')
          .hasValue(this.serviceAccount.name);
      } else {
        assert
          .dom('[data-test-serviceAccountSection-accountOverview-nameInput]')
          .hasNoValue();
      }

      assert
        .dom(
          '[data-test-serviceAccountSection-accountOverview-descriptionLabel]'
        )
        .containsText(t('description'));

      if (duplicate) {
        assert
          .dom(
            '[data-test-serviceAccountSection-accountOverview-descriptionInput]'
          )
          .hasValue(this.serviceAccount.description);
      } else {
        assert
          .dom(
            '[data-test-serviceAccountSection-accountOverview-descriptionInput]'
          )
          .hasNoValue();
      }

      // assert access token
      assert.dom(sectionHeadings[1]).hasText(t('accessToken'));

      assert
        .dom('[data-test-serviceAccountSection-accessToken-actionBtn]')
        .doesNotExist();

      assert
        .dom(
          '[data-test-serviceAccountSection-accessToken-createOrEditDescription]'
        )
        .hasText(t('serviceAccountModule.accessTokenCreateDescription'));

      if (duplicate) {
        assert
          .dom(
            '[data-test-serviceAccountSection-accessToken-expiryInDaysInput]'
          )
          .isDisabled();

        assert
          .dom(
            '[data-test-serviceAccountSection-accessToken-expiryInDaysDecrementBtn]'
          )
          .isDisabled();

        assert
          .dom(
            '[data-test-serviceAccountSection-accessToken-expiryInDaysIncrementBtn]'
          )
          .isDisabled();

        assert
          .dom(
            '[data-test-serviceAccountSection-accessToken-doesNotExpireCheckbox]'
          )
          .isChecked();

        assert
          .dom('[data-test-serviceAccountSection-accessToken-expiryHelperText]')
          .hasText(t('serviceAccountModule.doesNotExpireHelperText'));
      } else {
        assert
          .dom(
            '[data-test-serviceAccountSection-accessToken-expiryInDaysInput]'
          )
          .hasValue(`${defaultExpiryInDays}`);

        assert
          .dom(
            '[data-test-serviceAccountSection-accessToken-expiryInDaysDecrementBtn]'
          )
          .isNotDisabled();

        assert
          .dom(
            '[data-test-serviceAccountSection-accessToken-expiryInDaysIncrementBtn]'
          )
          .isNotDisabled();

        assert
          .dom(
            '[data-test-serviceAccountSection-accessToken-doesNotExpireCheckbox]'
          )
          .isNotChecked();

        assert
          .dom('[data-test-serviceAccountSection-accessToken-expiryHelperText]')
          .hasText(
            t('serviceAccountModule.expiryHelperText', {
              date: expiryInDate(defaultExpiryInDays),
            })
          );
      }

      assert
        .dom('[data-test-serviceAccountSection-accessToken-expiryUnitLabel]')
        .hasText(t('days'));

      // assert select scope
      assert.dom(sectionHeadings[2]).hasText(t('selectScope'));

      assert
        .dom('[data-test-serviceAccountSection-selectScope-actionBtn]')
        .doesNotExist();

      assert.dom('[data-test-ak-checkbox-tree-nodeCheckbox]').exists();

      const parentContainer = find(
        `[data-test-ak-checkbox-tree-nodeKey="public-api"]`
      );

      assert
        .dom(
          '[data-test-serviceAccountSection-selectScope-nodeLabel]',
          parentContainer
        )
        .containsText(t('serviceAccountModule.scopes.public-api.label'));

      for (const scope of scopeDetails) {
        const container = find(
          `[data-test-ak-checkbox-tree-nodeKey="${scope.key}"]`
        );

        if (duplicate) {
          assert
            .dom('[data-test-ak-checkbox-tree-nodeCheckbox]', container)
            [
              this.serviceAccount[underscore(scope.scopeKey)]
                ? 'isChecked'
                : 'isNotChecked'
            ]();
        } else {
          assert
            .dom('[data-test-ak-checkbox-tree-nodeCheckbox]', container)
            .isNotChecked();
        }

        assert
          .dom(
            '[data-test-serviceAccountSection-selectScope-nodeLabel]',
            container
          )
          .containsText(t(scope.scopeLabel));

        assert
          .dom(
            '[data-test-serviceAccountSection-selectScope-nodeLabelAccessType]',
            container
          )
          .containsText(t(scope.accessType));

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

        // assert selected project
        assert.dom(sectionHeadings[3]).hasText(t('selectProject'));

        assert
          .dom('[data-test-serviceAccountSection-selectProject-actionBtn]')
          .doesNotExist();

        assert
          .dom(
            '[data-test-serviceAccountSection-selectProject-projectAccessSelect] [data-test-form-label]'
          )
          .hasText(t('serviceAccountModule.projectAccess'));

        assert
          .dom(
            '[data-test-serviceAccountSection-selectProject-projectAccessInfoIcon]'
          )
          .doesNotExist();

        const selectedProjectAccess = projectAccessOptions.find((opt) =>
          opt.value === duplicate ? this.serviceAccount.all_projects : true
        );

        assert
          .dom(
            `[data-test-serviceAccountSection-selectProject-projectAccessSelect] .${classes.trigger}`
          )
          .hasText(t(selectedProjectAccess?.label));

        if (duplicate) {
          assert
            .dom(
              '[data-test-serviceAccountSection-selectProjectList-container]'
            )
            .exists();

          assert
            .dom('[data-test-serviceAccountSection-selectProjectList-emptySvg]')
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
        } else {
          assert
            .dom(
              '[data-test-serviceAccountSection-selectProjectList-container]'
            )
            .doesNotExist();
        }
      }
    }
  );

  test.each(
    'it creates service account',
    [{ duplicate: false }, { duplicate: true }],
    async function (assert, { duplicate }) {
      // feature is enabled
      this.organization.update({
        features: {
          public_apis: true,
        },
      });

      // role set to owner
      this.organizationMe.update({
        is_owner: true,
        is_admin: true,
      });

      if (duplicate) {
        this.serviceAccount.update({
          all_projects: false,
          expiry: null,
        });
      }

      const expiryInDate = (days) =>
        dayjs().add(days, 'days').format('MMM DD, YYYY');

      // create some projects
      const createExcludedProjects = () => this.server.createList('project', 6);

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

      this.server.get('/organizations/:id/projects', () => {
        const results = createExcludedProjects();

        return { count: results.length, next: null, previous: null, results };
      });

      this.server.get('/v2/projects/:id', (schema, req) => {
        return schema.projects.find(req.params.id).toJSON();
      });

      this.server.get('/service_accounts/:id', (schema, req) => {
        return schema.serviceAccounts.find(req.params.id).toJSON();
      });

      this.server.post('/service_accounts', (schema, req) => {
        const data = JSON.parse(req.requestBody);

        const serviceAccount = schema.serviceAccounts
          .create({
            ...data,
            access_key_id: faker.string.alphanumeric(10),
            secret_access_key: 'ak_sa_***************',
          })
          .toJSON();

        serviceAccount.secret_access_key = faker.string.alphanumeric(100);

        this.set('createdServiceAccount', serviceAccount);

        return serviceAccount;
      });

      await visit(
        '/dashboard/organization/settings/service-account/create'.concat(
          duplicate ? `?duplicate=${this.serviceAccount.id}` : ''
        )
      );

      assert
        .dom('[data-test-serviceAccountCreate-title]')
        .hasText(t('serviceAccountModule.createTitle'));

      assert
        .dom('[data-test-serviceAccountCreate-description]')
        .hasText(t('serviceAccountModule.createDescription'));

      assert
        .dom('[data-test-serviceAccountCreate-cancelLink]')
        .hasText(t('cancel'));

      assert
        .dom('[data-test-serviceAccountCreate-saveButton]')
        .isNotDisabled()
        .hasText(t('save'));

      // fill account overview
      await fillIn(
        '[data-test-serviceAccountSection-accountOverview-nameInput]',
        duplicate
          ? `${this.serviceAccount.name} duplicate`
          : 'Test Service Account'
      );

      if (!duplicate) {
        await fillIn(
          '[data-test-serviceAccountSection-accountOverview-descriptionInput]',
          'Test Description'
        );
      }

      // set access token expiry
      if (!duplicate) {
        // 31
        await click(
          '[data-test-serviceAccountSection-accessToken-expiryInDaysIncrementBtn]'
        );

        // 30
        await click(
          '[data-test-serviceAccountSection-accessToken-expiryInDaysDecrementBtn]'
        );

        // 31
        await click(
          '[data-test-serviceAccountSection-accessToken-expiryInDaysIncrementBtn]'
        );

        // 32
        await click(
          '[data-test-serviceAccountSection-accessToken-expiryInDaysIncrementBtn]'
        );

        assert
          .dom('[data-test-serviceAccountSection-accessToken-expiryHelperText]')
          .hasText(
            t('serviceAccountModule.expiryHelperText', {
              date: expiryInDate(32),
            })
          );
      }

      // check scope
      if (!duplicate) {
        const parentContainer = find(
          `[data-test-ak-checkbox-tree-nodeKey="public-api"]`
        );

        await click(
          parentContainer.querySelector(
            '[data-test-ak-checkbox-tree-nodeCheckbox]'
          )
        );
      }

      //select projects
      const selectedProjectAccess = projectAccessOptions.find((opt) =>
        opt.value === duplicate ? this.serviceAccount.all_projects : true
      );

      assert
        .dom(
          `[data-test-serviceAccountSection-selectProject-projectAccessSelect] .${classes.trigger}`
        )
        .hasText(t(selectedProjectAccess?.label));

      if (duplicate) {
        assert
          .dom(
            '[data-test-serviceAccountSection-selectProjectList-emptyAddProjectBtn]'
          )
          .isNotDisabled()
          .hasText(t('addProject'));

        await click(
          '[data-test-serviceAccountSection-selectProjectList-emptyAddProjectBtn]'
        );

        assert
          .dom('[data-test-serviceAccountAddProject-drawerContainer]')
          .exists();

        assert
          .dom('[data-test-serviceAccountAddProject-drawerTitle]')
          .hasText(t('addProject'));

        const rows = findAll('[data-test-serviceAccountAddProjectList-row]');

        assert.strictEqual(rows.length, 6);

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

        assert
          .dom('[data-test-serviceAccountAddProject-drawerContainer]')
          .doesNotExist();

        let listItems = findAll(
          '[data-test-serviceAccountSection-selectProjectList-item]'
        );

        // 3 projects selected
        assert.strictEqual(listItems.length, 3);

        // remove 1 project
        await click(
          listItems[1].querySelector(
            '[data-test-serviceAccountSection-selectProjectList-removeBtn]'
          )
        );

        listItems = findAll(
          '[data-test-serviceAccountSection-selectProjectList-item]'
        );

        // 2 projects selected
        assert.strictEqual(listItems.length, 2);
      }

      await click('[data-test-serviceAccountCreate-saveButton]');

      // assert after create
      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(
        notify.successMsg,
        t('serviceAccountModule.createSuccessMsg')
      );

      assert.strictEqual(
        currentURL(),
        `/dashboard/organization/settings/service-account/${this.createdServiceAccount.id}`
      );

      assert
        .dom('[data-test-serviceAccountSection-accountOverview-nameValue]')
        .hasText(this.createdServiceAccount.name);

      assert
        .dom(
          '[data-test-serviceAccountSection-accountOverview-descriptionValue]'
        )
        .hasText(this.createdServiceAccount.description);

      // assert access token section
      assert
        .dom('[data-test-serviceAccountSection-accessToken-accountIdValue]')
        .hasText(this.createdServiceAccount.access_key_id);

      assert
        .dom('[data-test-serviceAccountSection-accessToken-secretKeyValue]')
        .hasText(this.createdServiceAccount.secret_access_key);

      assert
        .dom(
          '[data-test-serviceAccountSection-accessToken-secretKeyHelperText]'
        )
        .hasText(t('serviceAccountModule.unmaskedSecretAccessKeyHelperText'));

      assert
        .dom('[data-test-serviceAccountSection-accessToken-secretKeyCopyBtn]')
        .isNotDisabled();

      assert
        .dom('[data-test-serviceAccountSection-accessToken-expiryValue]')
        .hasText(
          this.createdServiceAccount.expiry === null
            ? t('noExpiry')
            : dayjs(this.createdServiceAccount.expiry).format('MMM DD, YYYY')
        );

      // assert scopes section
      for (const scope of scopeDetails) {
        const container = find(
          `[data-test-ak-checkbox-tree-nodeKey="${scope.key}"]`
        );

        assert
          .dom(
            `[data-test-serviceAccountSection-selectScope-nodeLabelIcon="${this.createdServiceAccount[underscore(scope.scopeKey)] ? 'checked' : 'unchecked'}"]`,
            container
          )
          .exists();

        assert
          .dom(
            '[data-test-serviceAccountSection-selectScope-nodeLabel]',
            container
          )
          .containsText(t(scope.scopeLabel));

        assert
          .dom(
            '[data-test-serviceAccountSection-selectScope-nodeLabelAccessType]',
            container
          )
          .containsText(t(scope.accessType));

        assert
          .dom(
            '[data-test-serviceAccountSection-selectScope-nodeLabelInfoIcon]',
            container
          )
          .exists();
      }

      // assert select project section
      const projectAccess = projectAccessOptions.find(
        (opt) => opt.value === this.createdServiceAccount.all_projects
      );

      assert.strictEqual(
        find(
          '[data-test-serviceAccountSection-selectProject-selectedProjectAccess]'
        ).innerHTML.trim(),
        t('serviceAccountModule.selectedProjectAccess', {
          projectAccess: t(projectAccess?.label),
        })
      );

      if (this.createdServiceAccount.all_projects) {
        assert
          .dom('[data-test-serviceAccountSection-selectProjectList-container]')
          .doesNotExist();
      } else {
        assert
          .dom('[data-test-serviceAccountSection-selectProjectList-container]')
          .exists();

        const listItems = findAll(
          '[data-test-serviceAccountSection-selectProjectList-item]'
        );

        // 2 projects selected
        assert.strictEqual(listItems.length, 2);
      }
    }
  );

  test('it shows validation error for name & description', async function (assert) {
    // feature is enabled
    this.organization.update({
      features: {
        public_apis: true,
      },
    });

    // role set to owner
    this.organizationMe.update({
      is_owner: true,
      is_admin: true,
    });

    await visit('/dashboard/organization/settings/service-account/create');

    assert
      .dom('[data-test-serviceAccountCreate-title]')
      .hasText(t('serviceAccountModule.createTitle'));

    assert
      .dom('[data-test-serviceAccountCreate-description]')
      .hasText(t('serviceAccountModule.createDescription'));

    assert
      .dom('[data-test-serviceAccountCreate-cancelLink]')
      .hasText(t('cancel'));

    assert
      .dom('[data-test-serviceAccountCreate-saveButton]')
      .isNotDisabled()
      .hasText(t('save'));

    await click('[data-test-serviceAccountCreate-saveButton]');

    assert
      .dom('[data-test-serviceAccountSection-accountOverview-actionBtn]')
      .doesNotExist();

    assert.dom('[data-test-helper-text]').hasText("Name can't be blank");

    assert
      .dom(
        '[data-test-serviceAccountSection-accountOverview-descriptionInputError]'
      )
      .hasText("Description can't be blank");
  });

  test.each(
    'it redirects to projects page if feature is disabled or user does not have access',
    [{ featureNotEnabled: true }, { userHasNoAccess: true }],
    async function (assert) {
      if (this.featureNotEnabled) {
        this.organization.update({
          features: {
            public_apis: false,
          },
        });
      }

      if (this.userHasNoAccess) {
        this.organizationMe.update({
          is_owner: false,
          is_admin: false,
          is_member: true,
        });
      }

      this.server.get('/organizations/:id/projects', () => {
        return { previous: null, next: null, count: 0, results: [] };
      });

      await visit('/dashboard/organization/settings/service-account/create');

      assert.strictEqual(currentURL(), '/dashboard/projects');
    }
  );
});
