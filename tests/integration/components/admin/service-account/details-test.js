import { find, findAll, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import Service from '@ember/service';
import dayjs from 'dayjs';

import { compareInnerHTMLWithIntlTranslation } from 'irene/tests/test-utils';

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

const projectAccessOptions = () => [
  { label: t('allProjects'), value: true },
  { label: t('serviceAccountModule.forSpecificProjects'), value: false },
];

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
  'Integration | Component | admin/service-account/details',
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

    test('it renders', async function (assert) {
      assert.expect(43);

      this.server.get('/service_accounts/:id/service_account_projects', () => {
        return { count: 0, next: null, previous: null, results: [] };
      });

      await render(hbs`<Admin::ServiceAccount::Details
        @serviceAccount={{this.serviceAccount}}
      />`);

      assert
        .dom('[data-test-serviceAccountDetails-breadcrumbContainer]')
        .exists();

      assert
        .dom('[data-test-serviceAccountDetails-title]')
        .hasText(t('serviceAccountModule.detailsTitle'));

      assert
        .dom('[data-test-serviceAccountDetails-description]')
        .hasText(t('serviceAccountModule.detailsDescription'));

      assert
        .dom('[data-test-serviceAccountDetails-moreOptionsBtn]')
        .isNotDisabled();

      const sectionHeadings = findAll(
        '[data-test-serviceAccountSection-title]'
      );

      assert.strictEqual(sectionHeadings.length, 4);

      // assert account overview
      assert.dom(sectionHeadings[0]).hasText(t('accountOverview'));

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

      // assert access token section
      assert.dom(sectionHeadings[1]).hasText(t('accessToken'));

      assert
        .dom('[data-test-serviceAccountSection-accessToken-actionBtn]')
        .isNotDisabled();

      assert
        .dom('[data-test-serviceAccountSection-accessToken-accountIdLabel]')
        .hasText(t('accessKeyID'));

      assert
        .dom('[data-test-serviceAccountSection-accessToken-accountIdValue]')
        .hasText(this.serviceAccount.accessKeyId);

      assert
        .dom('[data-test-serviceAccountSection-accessToken-secretKeyLabel]')
        .hasText(t('serviceAccountModule.secretAccessKey'));

      assert
        .dom('[data-test-serviceAccountSection-accessToken-secretKeyMasked]')
        .hasAnyText();

      assert
        .dom(
          '[data-test-serviceAccountSection-accessToken-secretKeyHelperText]'
        )
        .hasText(t('serviceAccountModule.maskedSecretAccessKeyHelperText'));

      assert
        .dom('[data-test-serviceAccountSection-accessToken-expiryLabel]')
        .hasText(t('expiresOn'));

      assert
        .dom('[data-test-serviceAccountSection-accessToken-expiryValue]')
        .hasText(
          this.serviceAccount.expiry === null
            ? t('noExpiry')
            : dayjs(this.serviceAccount.expiry).format('MMM DD, YYYY')
        );

      // assert scopes section
      assert.dom(sectionHeadings[2]).hasText(t('selectedScope'));

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
      }

      // assert select project section
      assert.dom(sectionHeadings[3]).hasText(t('selectedProject'));

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

      compareInnerHTMLWithIntlTranslation(assert, {
        selector:
          '[data-test-serviceAccountSection-selectProject-selectedProjectAccess]',
        message: t('serviceAccountModule.selectedProjectAccess', {
          projectAccess: selectedProjectAccess?.label,
        }),
      });

      if (this.serviceAccount.allProjects) {
        assert
          .dom('[data-test-serviceAccountSection-selectProjectList-container]')
          .doesNotExist();
      } else {
        assert
          .dom('[data-test-serviceAccountSection-selectProjectList-container]')
          .exists();
      }

      // no action footer for any section
      assert.dom('[data-test-serviceAccountSection-footer]').doesNotExist();
    });
  }
);
