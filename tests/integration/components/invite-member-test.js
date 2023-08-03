import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { click, render, fillIn, findAll } from '@ember/test-helpers';
import { setupIntl } from 'ember-intl/test-support';
import { hbs } from 'ember-cli-htmlbars';
import { Response } from 'miragejs';

import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

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

class RealtimeStub extends Service {
  @tracked InvitationCounter = 0;
}

module('Integration | Component | invite-member', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    this.owner.register('service:realtime', RealtimeStub);
  });

  test('it renders invite-member', async function (assert) {
    await render(hbs`<InviteMember />`);

    assert.dom('[data-test-label-primary-text]').exists().hasText('t:email:()');

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
  });

  test.each(
    'test invite-member email input & chips',
    [
      ['test@mail.com', 0, ''],
      ['test@mail.com, test1@mail.com', 1, 'test@mail.com'],
      [
        'test@mail.com, test1@mail.com, test2@mail.com',
        1,
        'test@mail.com, test2@mail.com',
      ],
    ],
    async function (assert, [emailText, deleteIndex, expectedValue]) {
      await render(hbs`<InviteMember />`);

      assert
        .dom('[data-test-invite-member-input]')
        .exists()
        .isNotDisabled()
        .hasNoValue();

      await fillIn('[data-test-invite-member-input]', emailText);

      assert.dom('[data-test-invite-member-input]').hasValue(emailText);

      const emailList = emailText
        .split(',')
        .filter((e) => Boolean(e.trim()))
        .map((e) => e.trim());

      const chips = findAll('[data-test-email-chip]');

      assert.strictEqual(emailList.length, chips.length);

      chips.forEach((c, i) => {
        assert.dom(c).hasText(emailList[i]);
      });

      await click(
        `[data-test-email-chip="${deleteIndex}"] [data-test-chip-delete-btn]`
      );

      assert.strictEqual(
        findAll('[data-test-email-chip]').length,
        emailList.length - 1
      );

      assert.dom('[data-test-invite-member-input]').hasValue(expectedValue);
    }
  );

  test('test invite-member input error state', async function (assert) {
    await render(hbs`
      <InviteMember>
        <:actionContent as |ac|>
          <button data-test-send-invite-btn type="button" {{on 'click' ac.action}}>{{ac.actionLabel}}</button>
        </:actionContent>
      </InviteMember>
    `);

    assert
      .dom('[data-test-invite-member-input]')
      .exists()
      .isNotDisabled()
      .hasNoValue();

    assert
      .dom('[data-test-text-input-outlined]')
      .doesNotHaveClass(/ak-error-text-input/);

    assert.dom('[data-test-helper-text]').doesNotExist();
    assert.dom('[data-test-email-chip]').doesNotExist();

    assert
      .dom('[data-test-send-invite-btn]')
      .exists()
      .isNotDisabled()
      .hasText('t:invite:()');

    await click('[data-test-send-invite-btn]');

    assert
      .dom('[data-test-text-input-outlined]')
      .hasClass(/ak-error-text-input/);

    assert.dom('[data-test-helper-text]').exists().hasText('t:emptyEmailId:()');
  });

  test.each(
    'test invite-member send invites success',
    [['test@mail.com'], ['test@mail.com, test1@mail.com, test2@mail.com']],
    async function (assert, [emailText]) {
      this.server.createList('organization', 1);

      await this.owner.lookup('service:organization').load();
      this.owner.register('service:notifications', NotificationsStub);

      await render(hbs`
        <InviteMember>
          <:actionContent as |ac|>
            <button data-test-send-invite-btn type="button" {{on 'click' ac.action}}>{{ac.actionLabel}}</button>
          </:actionContent>
        </InviteMember>
      `);

      assert
        .dom('[data-test-invite-member-input]')
        .exists()
        .isNotDisabled()
        .hasNoValue();

      await fillIn('[data-test-invite-member-input]', emailText);

      assert.dom('[data-test-invite-member-input]').hasValue(emailText);

      const emailList = emailText
        .split(',')
        .filter((e) => Boolean(e.trim()))
        .map((e) => e.trim());

      const chips = findAll('[data-test-email-chip]');

      assert.strictEqual(emailList.length, chips.length);

      chips.forEach((c, i) => {
        assert.dom(c).hasText(emailList[i]);
      });

      await click('[data-test-send-invite-btn]');

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(notify.successMsg, 't:orgMemberInvited:()');

      const realtime = this.owner.lookup('service:realtime');

      assert.strictEqual(realtime.InvitationCounter, 1);
    }
  );

  test.each(
    'test invite-member send invites fails',
    [['test@mail.com'], ['test@mail.com, test1@mail.com, test2@mail.com']],
    async function (assert, [emailText]) {
      this.server.createList('organization', 1);

      await this.owner.lookup('service:organization').load();
      this.owner.register('service:notifications', NotificationsStub);

      this.server.post('/organizations/:id/invitations', () => {
        return new Response(500);
      });

      await render(hbs`
        <InviteMember>
          <:actionContent as |ac|>
            <button data-test-send-invite-btn type="button" {{on 'click' ac.action}}>{{ac.actionLabel}}</button>
          </:actionContent>
        </InviteMember>
      `);

      assert
        .dom('[data-test-invite-member-input]')
        .exists()
        .isNotDisabled()
        .hasNoValue();

      await fillIn('[data-test-invite-member-input]', emailText);

      assert.dom('[data-test-invite-member-input]').hasValue(emailText);

      const emailList = emailText
        .split(',')
        .filter((e) => Boolean(e.trim()))
        .map((e) => e.trim());

      const chips = findAll('[data-test-email-chip]');

      assert.strictEqual(emailList.length, chips.length);

      chips.forEach((c, i) => {
        assert.dom(c).hasText(emailList[i]);
      });

      await click('[data-test-send-invite-btn]');

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(notify.errorMsg, 't:pleaseTryAgain:()');
    }
  );
});
