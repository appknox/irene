import { module, test } from 'qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { faker } from '@faker-js/faker';

import { NfOvrreqRaisedContext } from 'irene/components/notifications-page/messages/nf-ovrreq-raised/context';
import { compareInnerHTMLWithIntlTranslation } from 'irene/tests/test-utils';

// ─── Selectors ─────────────────────────────────────────────────────────────────
const selectors = {
  primaryMessage: '[data-test-nf-ovrreq-raised-primary-message]',
  link: '[data-test-nf-ovrreq-raised-link]',
};

// ─── Template ──────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`<NotificationsPage::Messages::NfOvrreqRaised
  @notification={{this.notification}}
  @context={{this.context}}
/>`;

const CONTEXT = {
  file_id: faker.number.int({ min: 1, max: 1000 }),
  analysis_id: faker.number.int({ min: 1, max: 1000 }),
  vulnerability_id: faker.number.int({ min: 1, max: 1000 }),
  requester_username: faker.internet.userName(),
  requester_email: faker.internet.email(),
  override_request_uuid: faker.string.uuid(),
};

const ANALYSIS_URL = `/dashboard/file/${CONTEXT.file_id}/analysis/${CONTEXT.analysis_id}`;

module(
  'Integration | Component | notifications-page/messages/nf-ovrreq-raised',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.notification = this.server.create('nf-in-app-notification', {
        hasRead: false,
        messageCode: 'NF_OVRREQ_RAISED',
        context: new NfOvrreqRaisedContext(CONTEXT),
      });

      this.context = this.notification.context;
    });

    test('it renders the requester email in the primary message', async function (assert) {
      assert.expect(1);

      await render(TEMPLATE);

      compareInnerHTMLWithIntlTranslation(assert, {
        selector: selectors.primaryMessage,
        message: t('notificationModule.messages.nf-ovrreq-raised', {
          requester_email: this.context.requester_email,
        }),
      });
    });

    test('it renders a view request link to the vulnerability analysis', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.link).containsText(t('viewRequest'));
      assert.dom(`${selectors.link} a`).hasAttribute('href', ANALYSIS_URL);
    });
  }
);
