import { click, fillIn, render, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { Response } from 'miragejs';
import { faker } from '@faker-js/faker';
import Service from '@ember/service';
import dayjs from 'dayjs';

class NotificationsStub extends Service {
  errorMsg = null;
  successMsg = null;
  infoMsg = null;

  info(msg) {
    this.infoMsg = msg;
  }

  error(msg) {
    this.errorMsg = msg;
  }

  success(msg) {
    this.successMsg = msg;
  }
}

module(
  'Integration | Component | organization/service-account/section/access-token',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

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

    test.each(
      'it renders access token section',
      [true, false],
      async function (assert, noExpiry) {
        if (noExpiry) {
          this.serviceAccount.expiry = null;
        }

        await render(hbs`<Organization::ServiceAccount::Section::AccessToken
          @serviceAccount={{this.serviceAccount}}
        />`);

        assert
          .dom('[data-test-serviceAccountSection-title]')
          .hasText('t:accessToken:()');

        assert
          .dom('[data-test-serviceAccountSection-accessToken-actionBtn]')
          .isNotDisabled();

        assert
          .dom('[data-test-serviceAccountSection-accessToken-accountIdLabel]')
          .hasText('t:accountID:()');

        assert
          .dom('[data-test-serviceAccountSection-accessToken-accountIdValue]')
          .hasText(this.serviceAccount.accessKeyId);

        assert
          .dom('[data-test-serviceAccountSection-accessToken-secretKeyLabel]')
          .hasText('t:serviceAccountModule.secretAccountKey:()');

        assert
          .dom('[data-test-serviceAccountSection-accessToken-secretKeyMasked]')
          .hasAnyText();

        assert
          .dom(
            '[data-test-serviceAccountSection-accessToken-secretKeyHelperText]'
          )
          .hasText(
            't:serviceAccountModule.maskedSecretAccountKeyHelperText:()'
          );

        assert
          .dom('[data-test-serviceAccountSection-accessToken-expiryLabel]')
          .hasText('t:expiresOn:()');

        assert
          .dom('[data-test-serviceAccountSection-accessToken-expiryValue]')
          .hasText(
            noExpiry
              ? 't:noExpiry:()'
              : dayjs(this.serviceAccount.expiry).format('MMM DD, YYYY')
          );

        assert.dom('[data-test-serviceAccountSection-footer]').doesNotExist();
      }
    );

    test.each(
      'it should regenerate access token',
      [{ noExpiry: true }, { noExpiry: false }, { fail: true }],
      async function (assert, { noExpiry, fail }) {
        const defaultExpiryInDays = 30;
        const tempSecretKey = faker.string.alphanumeric(100);

        const expiryInDate = (days) =>
          dayjs().add(days, 'days').format('MMM DD, YYYY');

        this.server.put('/service_accounts/:id/key_reset', (schema, req) => {
          if (fail) {
            return new Response(502, {}, { detail: 'Regenerate failed' });
          }

          const data = JSON.parse(req.requestBody);

          const serviceAccount = schema.serviceAccounts
            .find(req.params.id)
            .update({
              expiry: data.expiry ? dayjs(data.expiry).toISOString() : null,
            });

          serviceAccount.secret_access_key = tempSecretKey;

          return serviceAccount.toJSON();
        });

        await render(hbs`<Organization::ServiceAccount::Section::AccessToken
          @serviceAccount={{this.serviceAccount}}
        />`);

        assert
          .dom('[data-test-serviceAccountSection-title]')
          .hasText('t:accessToken:()');

        assert
          .dom('[data-test-serviceAccountSection-accessToken-actionBtn]')
          .isNotDisabled();

        await click('[data-test-serviceAccountSection-accessToken-actionBtn]');

        assert
          .dom('[data-test-serviceAccountSection-accessToken-actionBtn]')
          .doesNotExist();

        assert.dom('[data-test-serviceAccountSection-footer]').exists();

        assert
          .dom(
            '[data-test-serviceAccountSection-accessToken-createOrEditDescription]'
          )
          .hasText('t:serviceAccountModule.accessTokenEditDescription:()');

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
          .dom('[data-test-serviceAccountSection-accessToken-expiryUnitLabel]')
          .hasText('t:days:()');

        assert
          .dom(
            '[data-test-serviceAccountSection-accessToken-doesNotExpireCheckbox]'
          )
          .isNotChecked();

        assert
          .dom('[data-test-serviceAccountSection-accessToken-expiryHelperText]')
          .hasText(
            `t:serviceAccountModule.expiryHelperText:("date":"${expiryInDate(defaultExpiryInDays)}")`
          );

        assert
          .dom('[data-test-serviceAccountSection-accessToken-regenerateBtn]')
          .isNotDisabled()
          .hasText('t:serviceAccountModule.regenerateKey:()');

        assert
          .dom('[data-test-serviceAccountSection-accessToken-cancelBtn]')
          .isNotDisabled()
          .hasText('t:cancel:()');

        if (noExpiry) {
          await click(
            '[data-test-serviceAccountSection-accessToken-doesNotExpireCheckbox]'
          );

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
        } else {
          await fillIn(
            '[data-test-serviceAccountSection-accessToken-expiryInDaysInput]',
            60
          );

          await triggerEvent(
            '[data-test-serviceAccountSection-accessToken-expiryInDaysInput]',
            'keyup'
          );

          assert
            .dom(
              '[data-test-serviceAccountSection-accessToken-expiryHelperText]'
            )
            .hasText(
              `t:serviceAccountModule.expiryHelperText:("date":"${expiryInDate(60)}")`
            );
        }

        await click(
          '[data-test-serviceAccountSection-accessToken-regenerateBtn]'
        );

        const notify = this.owner.lookup('service:notifications');

        if (fail) {
          assert.strictEqual(notify.errorMsg, 'Regenerate failed');

          assert
            .dom('[data-test-serviceAccountSection-accessToken-secretKeyValue]')
            .doesNotExist();

          assert
            .dom(
              '[data-test-serviceAccountSection-accessToken-secretKeyCopyBtn]'
            )
            .doesNotExist();
        } else {
          assert.strictEqual(
            notify.successMsg,
            't:serviceAccountModule.editSuccessMsg:()'
          );

          assert
            .dom('[data-test-serviceAccountSection-accessToken-secretKeyValue]')
            .hasText(tempSecretKey);

          assert
            .dom(
              '[data-test-serviceAccountSection-accessToken-secretKeyHelperText]'
            )
            .hasText(
              't:serviceAccountModule.unmaskedSecretAccountKeyHelperText:()'
            );

          assert
            .dom('[data-test-serviceAccountSection-accessToken-expiryValue]')
            .hasText(
              noExpiry
                ? 't:noExpiry:()'
                : dayjs(this.serviceAccount.expiry).format('MMM DD, YYYY')
            );

          assert
            .dom(
              '[data-test-serviceAccountSection-accessToken-secretKeyCopyBtn]'
            )
            .isNotDisabled();

          // test copy button
          await click(
            '[data-test-serviceAccountSection-accessToken-secretKeyCopyBtn]'
          );

          assert.strictEqual(notify.infoMsg, 't:tokenCopied:()');
        }
      }
    );
  }
);
