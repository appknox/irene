import {
  visit,
  fillIn,
  find,
  click,
  waitUntil,
  currentURL,
} from '@ember/test-helpers';

import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import { Response } from 'miragejs';
import Service from '@ember/service';

import { ReportRequestStatus } from 'irene/models/ai-reporting/report-request';
import { setupRequiredEndpoints } from 'irene/tests/helpers/acceptance-utils';

import {
  assertAkSelectTriggerExists,
  chooseAkSelectOption,
} from '../../helpers/mirage-utils';

// Notification Service
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

class PollServiceStub extends Service {
  callback = null;
  interval = null;

  startPolling(cb, interval) {
    this.callback = cb;
    this.interval = interval;

    return () => {};
  }
}

// Assert categories and their prompts
const assertPromptItemExists = async (assert) => {
  // Available categories and their prompts
  const categories = [
    {
      label: t('reportModule.categories.scan.label'),
      prompts: [
        t('reportModule.categories.scan.prompt1'),
        t('reportModule.categories.scan.prompt2'),
        t('reportModule.categories.scan.prompt3'),
        t('reportModule.categories.scan.prompt4'),
        t('reportModule.categories.scan.prompt5'),
      ],
    },
    {
      label: t('reportModule.categories.users.label'),
      prompts: [
        t('reportModule.categories.users.prompt1'),
        t('reportModule.categories.users.prompt2'),
        t('reportModule.categories.users.prompt3'),
        t('reportModule.categories.users.prompt4'),
        t('reportModule.categories.users.prompt5'),
      ],
    },
  ];

  // Assert prompts based on selected category
  for (const category of categories) {
    await chooseAkSelectOption({
      selectTriggerClass: '.select-category-class',
      labelToSelect: category.label,
    });

    category.prompts.forEach((prompt) => {
      const promptContainer = find(
        `[data-test-aiReporting-chatGenerate-promptItem='${prompt}']`
      );

      assert.dom(promptContainer).containsText(prompt);

      assert
        .dom('[data-test-aiReporting-chatGenerate-promptIcon]', promptContainer)
        .exists('Prompt icon exists');
    });
  }

  return categories;
};

// Test start
module('Acceptance | ai-reporting/chat-generate', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    // Stubs
    this.owner.register('service:notifications', NotificationsStub);
    this.owner.register('service:poll', PollServiceStub);

    // Server mocks
    this.server.get('/organizations/:id/ai_features', () => {
      return { reporting: true };
    });

    // Setup required endpoints
    const { organization, currentOrganizationMe } =
      await setupRequiredEndpoints(this.server);

    // Update organization with AI features
    organization.update({ ai_features: { reporting: true } });

    this.setProperties({ currentOrganizationMe, organization });
  });

  test('it renders main chat generate interface with no report command', async function (assert) {
    assert.expect();

    await visit('/dashboard/reports/generate');

    assert
      .dom('[data-test-aiReporting-chatGenerate-root]')
      .exists('Root element exists');

    assert
      .dom('[data-test-aiReporting-chatGenerate-title]')
      .containsText(t('reportModule.describeTheReport'));

    assert
      .dom('[data-test-aiReporting-chatGenerate-subtitle]')
      .containsText(t('reportModule.whatDoYouWantToLearn'));

    assert
      .dom('[data-test-aiReporting-chatGenerate-commandInput]')
      .exists('Command input exists')
      .hasValue('');

    assert
      .dom('[data-test-aiReporting-chatGenerate-characterCount]')
      .containsText('0 /')
      .containsText(t('reportModule.characterLimit'));

    assert
      .dom('[data-test-aiReporting-chatGenerate-generateBtn]')
      .hasText(t('reportModule.generateReport'))
      .isDisabled('Generate button is disabled when input is empty');

    assert
      .dom('[data-test-aiReporting-chatGenerate-promptTitle]')
      .containsText(t('reportModule.notSureWhatToWrite'));

    assert
      .dom('[data-test-aiReporting-chatGenerate-promptSubtitle]')
      .containsText(t('reportModule.clickPrompt'));

    assert
      .dom('[data-test-aiReporting-chatGenerate-promptListTitle]')
      .containsText(t('reportModule.basedOnTheCategory'));

    // Check if category select exists
    assertAkSelectTriggerExists(
      assert,
      '[data-test-aiReporting-chatGenerate-categorySelect]'
    );

    // Assert prompt items
    await assertPromptItemExists(assert);
  });

  test('generate button state', async function (assert) {
    // Report command
    const reportCommand = 'Test query';

    await visit('/dashboard/reports/generate');

    assert
      .dom('[data-test-aiReporting-chatGenerate-generateBtn]')
      .containsText(t('reportModule.generateReport'))
      .isDisabled('Generate button is disabled when input is empty');

    await fillIn(
      '[data-test-aiReporting-chatGenerate-commandInput]',
      reportCommand
    );

    assert
      .dom('[data-test-aiReporting-chatGenerate-commandInput]')
      .hasValue(reportCommand);

    assert
      .dom('[data-test-aiReporting-chatGenerate-generateBtn]')
      .isNotDisabled('Generate button is enabled when input has content');

    await fillIn('[data-test-aiReporting-chatGenerate-commandInput]', '');

    assert
      .dom('[data-test-aiReporting-chatGenerate-commandInput]')
      .hasValue('');

    assert
      .dom('[data-test-aiReporting-chatGenerate-generateBtn]')
      .isDisabled('Generate button is disabled when input is empty');
  });

  test('character count updates when typing', async function (assert) {
    // Report command
    const reportCommand = 'Test query';

    await visit('/dashboard/reports/generate');

    await fillIn(
      '[data-test-aiReporting-chatGenerate-commandInput]',
      reportCommand
    );

    assert
      .dom('[data-test-aiReporting-chatGenerate-characterCount]')
      .containsText(`${reportCommand.length} /`)
      .containsText(t('reportModule.characterLimit'));
  });

  test('displays all prompt items and updates command input when a prompt is selected', async function (assert) {
    assert.expect();

    await visit('/dashboard/reports/generate');

    // Assert prompt items
    const categories = await assertPromptItemExists(assert);
    const secondCategory = categories[1];

    await chooseAkSelectOption({
      selectTriggerClass: '.select-category-class',
      labelToSelect: secondCategory.label,
    });

    // Select a prompt item
    const promptItem = secondCategory.prompts[0];
    const promptContainer = `[data-test-aiReporting-chatGenerate-promptItem='${promptItem}']`;

    const promptBtn = find(
      `${promptContainer} [data-test-aiReporting-chatGenerate-promptBtn]`
    );

    await click(promptBtn);

    // Assert command input has the prompt item
    assert
      .dom('[data-test-aiReporting-chatGenerate-commandInput]')
      .hasValue(promptItem);

    assert
      .dom('[data-test-aiReporting-chatGenerate-characterCount]')
      .containsText(promptItem.length);
  });

  test.each(
    'reporting feature is disabled',
    [{ is_owner: true }, { is_owner: false }],
    async function (assert, { is_owner }) {
      assert.expect();

      // Update current organization me
      this.currentOrganizationMe.update({ is_owner });

      // Server mock
      this.server.get('/organizations/:id/ai_features', () => {
        return { reporting: false };
      });

      await visit('/dashboard/reports/generate');

      assert
        .dom('[data-test-aiReporting-chatGenerate-turnOnSettings-root]')
        .exists('Turn on settings root element exists');

      assert
        .dom('[data-test-aiReporting-chatGenerate-turnOnSettings-svg]')
        .exists('Turn on settings svg element exists');

      assert
        .dom('[data-test-aiReporting-chatGenerate-turnOnSettings-headerText]')
        .hasText(t('reportModule.turnOnSettingsHeaderText'));

      assert
        .dom('[data-test-aiReporting-chatGenerate-turnOnSettings-bodyText]')
        .hasText(t('reportModule.turnOnSettingsBodyText'));

      // Link to turn on settings is only visible for organization owner
      if (is_owner) {
        assert
          .dom('[data-test-aiReporting-chatGenerate-turnOnSettings-button]')
          .hasText(t('reportModule.turnOnSettingsButtonLabel'))
          .hasAttribute(
            'href',
            '/dashboard/organization/settings/ai-powered-features'
          )
          .hasAttribute('target', '_blank');
      } else {
        assert
          .dom('[data-test-aiReporting-chatGenerate-turnOnSettings-button]')
          .doesNotExist('Turn on settings button does not exist');
      }
    }
  );

  test.each(
    'generate report',
    [{ success: true }, { success: false }],
    async function (assert, { success }) {
      assert.expect();

      // Report command
      const reportCommand = 'Test query';
      const errorMessage = 'Error';

      // Server mock
      this.server.post(
        '/ai_reporting/report_request',
        (schema, request) => {
          if (!success) {
            return new Response(
              400,
              {},
              {
                detail: JSON.stringify({
                  message: errorMessage,
                }),
              }
            );
          }

          const body = JSON.parse(request.requestBody);

          // Assert report command
          assert.strictEqual(body.query, reportCommand);

          const reportRequest = this.server.create(
            'ai-reporting/report-request',
            body,
            { status: ReportRequestStatus.PENDING }
          );

          this.set('reportGenerated', true);

          return {
            is_relevant: true,
            user_id: this.currentOrganizationMe.id,
            organization_id: this.organization.id,
            query: reportCommand,
            report_type: 'csv',
            error: false,
            error_message: null,
            ...reportRequest.toJSON(),
          };
        },
        { timing: 150 }
      );

      this.server.get('/ai_reporting/report_request/:id', (schema, request) => {
        const reportRequest = schema['aiReporting/reportRequests'].find(
          request.params.id
        );

        // Update report request
        reportRequest.update({
          status: ReportRequestStatus.COMPLETED,
          report_type: 'csv',
          error: false,
          error_message: null,
        });

        return reportRequest.toJSON();
      });

      // Test start
      await visit('/dashboard/reports/generate');

      assert
        .dom('[data-test-aiReporting-chatGenerate-commandInput]')
        .hasValue('');

      // Type report command
      await fillIn(
        '[data-test-aiReporting-chatGenerate-commandInput]',
        reportCommand
      );

      assert
        .dom('[data-test-aiReporting-chatGenerate-commandInput]')
        .hasValue(reportCommand);

      // Click generate button
      await click('[data-test-aiReporting-chatGenerate-generateBtn]');

      if (success) {
        assert
          .dom('[data-test-aiReporting-chatGenerate-generateLoader]')
          .exists('Generate loader container exists');

        assert
          .dom('[data-test-main-loader-ai-illustration]')
          .exists('Generate loader illustration exists');

        assert
          .dom('[data-test-aiReporting-chatGenerate-generateLoader-headerText]')
          .hasText(t('reportModule.promtGenerateLoadingHeader'));

        assert
          .dom(
            '[data-test-aiReporting-chatGenerate-generateLoader-descriptionText]'
          )
          .hasText(t('reportModule.promtGenerateLoadingDesc'));

        // Assert report is generated
        await waitUntil(() => this.reportGenerated, { timeout: 150 });

        // Trigger poll callback
        const pollService = this.owner.lookup('service:poll');

        await pollService.callback();
        await pollService.callback();

        // Assert report is generated
        await waitUntil(() => currentURL().includes('reports/preview'), {
          timeout: 10000,
        });

        // Assert user is redirected to report preview
        assert.strictEqual(currentURL(), '/dashboard/reports/preview/1');
      } else {
        const notifyService = this.owner.lookup('service:notifications');

        assert.strictEqual(
          notifyService.errorMsg,
          errorMessage,
          'Error message is displayed'
        );
      }
    }
  );
});
