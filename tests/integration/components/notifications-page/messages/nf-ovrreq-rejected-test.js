import { module, test } from 'qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { faker } from '@faker-js/faker';

import { NfOvrreqRejectedContext } from 'irene/components/notifications-page/messages/nf-ovrreq-rejected/context';

// ─── Selectors ─────────────────────────────────────────────────────────────────
const selectors = {
  primaryMessage: '[data-test-nf-ovrreq-rejected-primary-message]',
  rejectionReasonLabel: '[data-test-nf-ovrreq-rejected-rejection-reason-label]',
  rejectionReason: '[data-test-nf-ovrreq-rejected-rejection-reason]',
  link: '[data-test-nf-ovrreq-rejected-link]',
};

// ─── Template ──────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`<NotificationsPage::Messages::NfOvrreqRejected
  @notification={{this.notification}}
  @context={{this.context}}
/>`;

const CONTEXT = {
  file_id: faker.number.int({ min: 1, max: 1000 }),
  analysis_id: faker.number.int({ min: 1, max: 1000 }),
  vulnerability_id: faker.number.int({ min: 1, max: 1000 }),
  rejection_reason: faker.lorem.sentence(),
  reviewer_username: faker.internet.userName(),
  reviewer_email: faker.internet.email(),
  requester_username: faker.internet.userName(),
  requester_email: faker.internet.email(),
  override_request_uuid: faker.string.uuid(),
};

const ANALYSIS_URL = `/dashboard/file/${CONTEXT.file_id}/analysis/${CONTEXT.analysis_id}`;

module(
  'Integration | Component | notifications-page/messages/nf-ovrreq-rejected',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.notification = this.server.create('nf-in-app-notification', {
        hasRead: false,
        messageCode: 'NF_OVRREQ_REJECTED',
        context: new NfOvrreqRejectedContext(CONTEXT),
      });

      this.context = this.notification.context;
    });

    test('it renders the reviewer email in the primary message', async function (assert) {
      await render(TEMPLATE);

      assert
        .dom(selectors.primaryMessage)
        .containsText(this.context.reviewer_email);
    });

    test('it links the vulnerability id inside the primary message', async function (assert) {
      await render(TEMPLATE);

      assert
        .dom(selectors.primaryMessage)
        .containsText(
          `${t('vulnerabilityId')} - ${this.context.vulnerability_id}`
        );

      assert
        .dom(`${selectors.primaryMessage} a`)
        .hasAttribute('href', ANALYSIS_URL);
    });

    test('it renders the rejection reason with its label', async function (assert) {
      await render(TEMPLATE);

      assert
        .dom(selectors.rejectionReasonLabel)
        .hasText(t('reasoningToReject'));

      assert
        .dom(selectors.rejectionReason)
        .hasText(this.context.rejection_reason);
    });

    test('it renders a view the vulnerability link to the analysis', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.link).containsText(t('viewTheVulnerability'));

      assert.dom(`${selectors.link} a`).hasAttribute('href', ANALYSIS_URL);
    });
  }
);
