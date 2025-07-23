import { Response } from 'miragejs';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import Service from '@ember/service';

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

module(
  'Integration | Component | project-settings/analysis-settings/email-notifications',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      // Services
      this.owner.register('service:notifications', NotificationsStub);
      this.store = this.owner.lookup('service:store');

      // Models
      const profile = this.server.create('profile');

      const project = this.server.create('project', {
        active_profile_id: profile.id,
      });

      this.set(
        'project',
        this.store.push(this.store.normalize('project', project.toJSON()))
      );

      // Server mocks
      this.server.get('profiles/:id', (schema, request) => {
        return schema.profiles.find(request.params.id).toJSON();
      });

      this.server.get('/profiles/:id/va_notif_emails', (schema) => {
        return schema.profileVaNotifEmails.all().models;
      });

      this.setProperties({
        profileId: profile.id,
      });
    });

    test('it should render email addresses if they are set', async function (assert) {
      assert.expect(11);

      const emails = this.server.createList('profile-va-notif-email', 5);

      await render(
        hbs`<ProjectSettings::AnalysisSettings::EmailNotifications @profileId={{this.profileId}} />`
      );

      assert
        .dom(
          '[data-test-projectSettings-analysisSettings-email-notifications-title]'
        )
        .hasText(t('emailNotifications'));

      compareInnerHTMLWithIntlTranslation(assert, {
        selector:
          '[data-test-projectSettings-analysisSettings-email-notifications-subtitle]',
        message: t('emailNotificationsDescription'),
      });

      assert
        .dom(
          '[data-test-projectSettings-analysisSettings-email-notifications-input]'
        )
        .hasValue('')
        .isNotDisabled();

      assert
        .dom(
          '[data-test-projectSettings-analysisSettings-email-notifications-saveBtn]'
        )
        .hasText(t('addEmail'))
        .isDisabled();

      for (const email of emails) {
        assert
          .dom(
            `[data-test-projectSettings-analysisSettings-email-notifications-chip="${email.email}"]`
          )
          .hasText(email.email);
      }
    });

    test.each(
      'it should handle delete email',
      [{ fail: false }, { fail: true }],
      async function (assert, { fail }) {
        const emails = this.server.createList('profile-va-notif-email', 5);

        this.server.delete(
          '/profiles/:id/va_notif_emails/:id',
          (schema, req) => {
            return fail
              ? new Response(500)
              : schema.profileVaNotifEmails.find(req.params.id).destroy();
          }
        );

        await render(
          hbs`<ProjectSettings::AnalysisSettings::EmailNotifications @profileId={{this.profileId}} />`
        );

        const emailItemSelector =
          '[data-test-projectSettings-analysisSettings-email-notifications-item]';

        let emailItems = findAll(emailItemSelector);

        assert.strictEqual(emailItems.length, emails.length);

        const chipSelector = `[data-test-projectSettings-analysisSettings-email-notifications-chip="${emails[1].email}"]`;

        await click(`${chipSelector} [data-test-chip-delete-btn]`);

        const notify = this.owner.lookup('service:notifications');

        if (fail) {
          emailItems = findAll(emailItemSelector);

          assert.strictEqual(emailItems.length, emails.length);

          assert.dom(chipSelector).exists();

          assert.strictEqual(
            notify.errorMsg,
            'The backend responded with an error'
          );
        } else {
          emailItems = findAll(emailItemSelector);
          assert.strictEqual(emailItems.length, emails.length - 1);

          assert.dom(chipSelector).doesNotExist();
          assert.strictEqual(notify.successMsg, t('emailDeleted'));
        }
      }
    );

    test.each(
      'it should handle add email',
      [{ fail: false }, { fail: true }],
      async function (assert, { fail }) {
        this.server.get('/profiles/:id/va_notif_emails', () => {
          return [];
        });

        this.server.post('/profiles/:id/va_notif_emails', (schema, req) => {
          if (fail) {
            return new Response(500);
          }

          const email = schema.profileVaNotifEmails.create(
            JSON.parse(req.requestBody)
          );

          this.set('response', email);

          return email.toJSON();
        });

        await render(
          hbs`<ProjectSettings::AnalysisSettings::EmailNotifications @profileId={{this.profileId}} />`
        );

        const emailItemSelector =
          '[data-test-projectSettings-analysisSettings-email-notifications-item]';

        let emailItems = findAll(emailItemSelector);

        assert.strictEqual(emailItems.length, 0);

        await fillIn(
          '[data-test-projectSettings-analysisSettings-email-notifications-input]',
          'test@test.io'
        );

        await click(
          '[data-test-projectSettings-analysisSettings-email-notifications-saveBtn]'
        );

        const notify = this.owner.lookup('service:notifications');

        if (fail) {
          assert.strictEqual(
            notify.errorMsg,
            'The backend responded with an error'
          );

          emailItems = findAll(emailItemSelector);
          assert.strictEqual(emailItems.length, 0);
        } else {
          assert.strictEqual(
            notify.successMsg,
            `${this.response.email} ${t('addedSuccessfully')}`
          );

          emailItems = findAll(emailItemSelector);

          assert.strictEqual(emailItems.length, 1);

          assert
            .dom(
              `[data-test-projectSettings-analysisSettings-email-notifications-chip="${this.response.email}"]`
            )
            .hasText(this.response.email);
        }
      }
    );

    test('add email btn should be disabled if input is empty', async function (assert) {
      const email = 'test@test.io';

      this.server.get('/profiles/:id/va_notif_emails', () => {
        return [];
      });

      await render(
        hbs`<ProjectSettings::AnalysisSettings::EmailNotifications @profileId={{this.profileId}} />`
      );

      assert
        .dom(
          '[data-test-projectSettings-analysisSettings-email-notifications-input]'
        )
        .isNotDisabled()
        .hasNoValue();

      assert
        .dom(
          '[data-test-projectSettings-analysisSettings-email-notifications-saveBtn]'
        )
        .isDisabled();

      await fillIn(
        '[data-test-projectSettings-analysisSettings-email-notifications-input]',
        email
      );

      assert
        .dom(
          '[data-test-projectSettings-analysisSettings-email-notifications-input]'
        )
        .hasValue(email);

      assert
        .dom(
          '[data-test-projectSettings-analysisSettings-email-notifications-saveBtn]'
        )
        .isNotDisabled();
    });

    test('add email btn should be disabled if input is invalid', async function (assert) {
      const email = 'test@test';

      this.server.get('/profiles/:id/va_notif_emails', () => {
        return [];
      });

      await render(
        hbs`<ProjectSettings::AnalysisSettings::EmailNotifications @profileId={{this.profileId}} />`
      );

      assert
        .dom(
          '[data-test-projectSettings-analysisSettings-email-notifications-input]'
        )
        .isNotDisabled()
        .hasNoValue();

      assert
        .dom(
          '[data-test-projectSettings-analysisSettings-email-notifications-saveBtn]'
        )
        .isDisabled();

      await fillIn(
        '[data-test-projectSettings-analysisSettings-email-notifications-input]',
        email
      );

      assert
        .dom(
          '[data-test-projectSettings-analysisSettings-email-notifications-input]'
        )
        .hasValue(email);

      await click(
        '[data-test-projectSettings-analysisSettings-email-notifications-saveBtn]'
      );

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(notify.errorMsg, t('invalidEmailAddress'));
    });

    test('add email btn should be disabled if input is already added', async function (assert) {
      const email = 'test@test.io';

      this.server.get('/profiles/:id/va_notif_emails', () => {
        return [];
      });

      this.server.post('/profiles/:id/va_notif_emails', (schema, req) => {
        const email = schema.profileVaNotifEmails.create(
          JSON.parse(req.requestBody)
        );

        this.set('response', email);

        return email.toJSON();
      });

      await render(
        hbs`<ProjectSettings::AnalysisSettings::EmailNotifications @profileId={{this.profileId}} />`
      );

      const emailInputSelector =
        '[data-test-projectSettings-analysisSettings-email-notifications-input]';

      const emailSaveBtnSelector =
        '[data-test-projectSettings-analysisSettings-email-notifications-saveBtn]';

      assert.dom(emailInputSelector).isNotDisabled().hasNoValue();
      assert.dom(emailSaveBtnSelector).isDisabled();

      await fillIn(emailInputSelector, email);

      assert.dom(emailInputSelector).hasValue(email);

      await click(emailSaveBtnSelector);

      // Assert that the email is already added
      const emailItemSelector =
        '[data-test-projectSettings-analysisSettings-email-notifications-item]';

      let emailItems = findAll(emailItemSelector);

      assert.strictEqual(emailItems.length, 1);

      assert
        .dom(
          `[data-test-projectSettings-analysisSettings-email-notifications-chip="${email}"]`
        )
        .hasText(email);

      // Add email again
      await fillIn(emailInputSelector, email);
      await click(emailSaveBtnSelector);

      emailItems = findAll(emailItemSelector);

      assert.strictEqual(emailItems.length, 1);

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(notify.errorMsg, t('emailAlreadyAdded'));
    });
  }
);
