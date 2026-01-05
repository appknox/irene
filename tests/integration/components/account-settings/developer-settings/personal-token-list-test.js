import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
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
  info(msg) {
    this.infoMsg = msg;
  }
}

module(
  'Integration | Component | account-settings/developer-settings/personal-token-list',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      this.server.createList('organization', 1);

      await this.owner.lookup('service:organization').load();

      this.owner.register('service:notifications', NotificationsStub);
      this.notifications = this.owner.lookup('service:notifications');
    });

    test('it renders empty state when no tokens exist', async function (assert) {
      await render(hbs`
        <AccountSettings::DeveloperSettings::PersonalTokenList />
      `);

      assert.dom('[data-test-developerSettingsPersonalToken-input]').exists();

      assert
        .dom('[data-test-developerSettingsPersonalToken-submitBtn]')
        .hasText(t('personalAccessTokenCreate'));

      assert
        .dom('[data-test-developerSettingsPersonalToken-table]')
        .doesNotExist();
    });

    test('it shows error when submitting empty token name', async function (assert) {
      await render(hbs`
        <AccountSettings::DeveloperSettings::PersonalTokenList />
      `);

      await click('[data-test-developerSettingsPersonalToken-submitBtn]');

      assert.strictEqual(this.notifications.errorMsg, t('enterTokenName'));
    });

    test('it creates a new token successfully', async function (assert) {
      const tokenName = 'Test Token';

      this.server.create('personaltoken', {
        name: tokenName,
        key: 'test-key-123',
        created: new Date().toISOString(),
      });

      this.server.post('/personaltokens/', () => {
        return this.server.schema.personaltokens.all().models[0];
      });

      await render(hbs`
        <AccountSettings::DeveloperSettings::PersonalTokenList />
      `);

      await fillIn(
        '[data-test-developerSettingsPersonalToken-input]',
        tokenName
      );

      await click('[data-test-developerSettingsPersonalToken-submitBtn]');

      assert.strictEqual(
        this.notifications.successMsg,
        t('personalTokenGenerated')
      );
    });

    test('it shows error for duplicate token name', async function (assert) {
      const tokenName = 'Duplicate Token';

      this.server.post('/personaltokens/', () => {
        return new Response(
          400,
          {},
          {
            errors: [
              {
                code: 'unique',
                detail: 'Token name already exists',
              },
            ],
          }
        );
      });

      await render(hbs`
        <AccountSettings::DeveloperSettings::PersonalTokenList />
      `);

      await fillIn(
        '[data-test-developerSettingsPersonalToken-input]',
        tokenName
      );

      await click('[data-test-developerSettingsPersonalToken-submitBtn]');

      assert.strictEqual(
        this.notifications.errorMsg,
        t('personalTokenNameDuplicate')
      );
    });

    test('it displays existing tokens in a table', async function (assert) {
      const tokens = [
        this.server.create('personaltoken', {
          id: 1,
          name: 'Token 1',
          key: 'key-1',
          created: new Date().toISOString(),
        }),
        this.server.create('personaltoken', {
          id: 2,
          name: 'Token 2',
          key: 'key-2',
          created: new Date().toISOString(),
        }),
      ];

      this.server.get('/personaltokens', () => {
        return {
          data: tokens.map((token) => ({
            type: 'personaltokens',
            id: token.id,
            attributes: {
              pk: token.id,
              key: token.key,
              name: token.name,
              created: token.created,
            },
          })),
        };
      });

      await render(hbs`
        <AccountSettings::DeveloperSettings::PersonalTokenList />
      `);

      assert.dom('[data-test-developerSettingsPersonalToken-table]').exists();

      assert
        .dom('[data-test-developerSettingsPersonalToken-row]')
        .exists({ count: 2 });

      tokens.forEach((token, index) => {
        const rowSelector = `[data-test-developerSettingsPersonalToken-row]:nth-of-type(${
          index + 1
        })`;

        assert
          .dom(`${rowSelector} [data-test-developerSettingsPersonalToken-cell]`)
          .hasText(token.name);
      });
    });

    test('it allows copying a token', async function (assert) {
      const token = this.server.create('personaltoken', {
        id: 1,
        name: 'Test Token',
        key: 'test-key-123',
        created: new Date().toISOString(),
      });

      this.server.get('/personaltokens', () => {
        return {
          data: [
            {
              type: 'personaltokens',
              id: token.id,
              attributes: {
                pk: token.id,
                key: token.key,
                name: token.name,
                created: token.created,
              },
            },
          ],
        };
      });

      await render(hbs`
        <AccountSettings::DeveloperSettings::PersonalTokenList />
      `);

      // Click the copy button
      await click('[data-test-developerSettingsPersonalToken-copyButton]');

      const copyButton = this.element.querySelector(
        '[data-test-developerSettingsPersonalToken-copyButton]'
      );

      assert.strictEqual(
        copyButton.getAttribute('data-clipboard-text'),
        token.key
      );
    });

    test('it allows deleting a token', async function (assert) {
      const token = this.server.create('personaltoken', {
        id: 1,
        name: 'Test Token',
        key: 'test-key-123',
        created: new Date().toISOString(),
      });

      this.server.get('/personaltokens', () => {
        return {
          data: [
            {
              type: 'personaltokens',
              id: token.id,
              attributes: {
                pk: token.id,
                key: token.key,
                name: token.name,
                created: token.created,
              },
            },
          ],
        };
      });

      this.server.delete('/personaltokens/:id', (schema, req) => {
        schema.db.personaltokens.remove(req.params.id);

        return new Response(204);
      });

      await render(hbs`
        <AccountSettings::DeveloperSettings::PersonalTokenList />
      `);

      // Click delete button
      await click('[data-test-developerSettingsPersonalToken-deleteButton]');

      // Confirm deletion
      await click('[data-test-confirmBox-confirmBtn]');

      // Verify success message
      assert.strictEqual(
        this.notifications.successMsg,
        t('personalTokenRevoked'),
        'shows success message after deletion'
      );
    });
  }
);
