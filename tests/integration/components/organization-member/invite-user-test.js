import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { click, render, fillIn } from '@ember/test-helpers';
import { setupIntl } from 'ember-intl/test-support';
import { hbs } from 'ember-cli-htmlbars';
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

module(
  'Integration | Component | organization-member/invite-user',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    test('it renders invite-user', async function (assert) {
      await render(hbs`<OrganizationMember::InviteUser />`);

      assert
        .dom('[data-test-invite-member-btn]')
        .exists()
        .isNotDisabled()
        .hasText('t:inviteUsers:()');
    });

    test('test invite-user drawer', async function (assert) {
      await render(hbs`<OrganizationMember::InviteUser />`);

      assert
        .dom('[data-test-invite-member-btn]')
        .exists()
        .isNotDisabled()
        .hasText('t:inviteUsers:()');

      await click('[data-test-invite-member-btn]');

      assert
        .dom('[data-test-drawer-title]')
        .exists()
        .hasText('t:inviteUsers:()');

      assert.dom('[data-test-drawer-close-btn]').exists().isNotDisabled();

      assert
        .dom('[data-test-label-primary-text]')
        .exists()
        .hasText('t:email:()');

      assert
        .dom('[data-test-label-secondary-text]')
        .exists()
        .hasText('t:inviteUserMultipleEmailHelperText:()');

      assert
        .dom('[data-test-invite-member-input]')
        .exists()
        .isNotDisabled()
        .hasNoValue();

      assert.dom('[data-test-email-chip]').doesNotExist();

      assert
        .dom('[data-test-send-invite-btn]')
        .exists()
        .isNotDisabled()
        .hasText('t:invite:()');

      await click('[data-test-drawer-close-btn]');

      assert.dom('[data-test-drawer-title]').doesNotExist();
      assert.dom('[data-test-drawer-close-btn]').doesNotExist();
      assert.dom('[data-test-label-primary-text]').doesNotExist();
      assert.dom('[data-test-label-secondary-text]').doesNotExist();
      assert.dom('[data-test-invite-member-input]').doesNotExist();
      assert.dom('[data-test-send-invite-btn]').doesNotExist();
      assert.dom('[data-test-email-chip]').doesNotExist();
    });

    test('test invite-user send invites success', async function (assert) {
      this.server.createList('organization', 1);

      await this.owner.lookup('service:organization').load();
      this.owner.register('service:notifications', NotificationsStub);

      const createOrgInvite = (email) =>
        this.server.create('organization-invitation', { email });

      this.server.post('/organizations/:id/invitations', (_, req) => {
        const data = JSON.parse(req.requestBody);

        return createOrgInvite(data.email)?.toJSON();
      });

      await render(hbs`<OrganizationMember::InviteUser />`);

      assert
        .dom('[data-test-invite-member-btn]')
        .exists()
        .isNotDisabled()
        .hasText('t:inviteUsers:()');

      await click('[data-test-invite-member-btn]');

      assert
        .dom('[data-test-invite-member-input]')
        .exists()
        .isNotDisabled()
        .hasNoValue();

      await fillIn('[data-test-invite-member-input]', 'test@mail.com');

      assert.dom('[data-test-invite-member-input]').hasValue('test@mail.com');

      assert.dom('[data-test-email-chip]').hasText('test@mail.com');

      await click('[data-test-send-invite-btn]');

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(notify.successMsg, 't:orgMemberInvited:()');
      assert.dom('[data-test-drawer-title]').doesNotExist();
      assert.dom('[data-test-drawer-close-btn]').doesNotExist();
      assert.dom('[data-test-label-primary-text]').doesNotExist();
      assert.dom('[data-test-label-secondary-text]').doesNotExist();
      assert.dom('[data-test-invite-member-input]').doesNotExist();
      assert.dom('[data-test-send-invite-btn]').doesNotExist();
      assert.dom('[data-test-email-chip]').doesNotExist();
    });

    test('test invite-user send invites fails', async function (assert) {
      this.server.createList('organization', 1);

      await this.owner.lookup('service:organization').load();
      this.owner.register('service:notifications', NotificationsStub);

      this.server.post('/organizations/:id/invitations', () => {
        return new Response(500);
      });

      await render(hbs`<OrganizationMember::InviteUser />`);

      assert
        .dom('[data-test-invite-member-btn]')
        .exists()
        .isNotDisabled()
        .hasText('t:inviteUsers:()');

      await click('[data-test-invite-member-btn]');

      assert
        .dom('[data-test-invite-member-input]')
        .exists()
        .isNotDisabled()
        .hasNoValue();

      await fillIn('[data-test-invite-member-input]', 'test@mail.com');

      assert.dom('[data-test-invite-member-input]').hasValue('test@mail.com');

      assert.dom('[data-test-email-chip]').hasText('test@mail.com');

      await click('[data-test-send-invite-btn]');

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(notify.errorMsg, 't:pleaseTryAgain:()');
      assert.dom('[data-test-drawer-title]').exists();
      assert.dom('[data-test-drawer-close-btn]').exists();
      assert.dom('[data-test-label-primary-text]').exists();
      assert.dom('[data-test-label-secondary-text]').exists();
      assert.dom('[data-test-invite-member-input]').exists();
      assert.dom('[data-test-send-invite-btn]').exists();
      assert.dom('[data-test-email-chip]').exists();
    });
  }
);
