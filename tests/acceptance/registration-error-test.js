import { module, test } from 'qunit';
import { find, visit } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import Service from '@ember/service';
import { faker } from '@faker-js/faker';
import { Response } from 'miragejs';
import { setupRequiredEndpoints } from '../helpers/acceptance-utils';

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

module('Acceptance | registration error', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    await setupRequiredEndpoints(this.server);

    this.owner.register('service:integration', IntegrationStub);
  });

  test('it redirects via-partner-invite to error page when token is invalid', async function (assert) {
    const token = faker.string.alphanumeric({ length: 50 });

    this.server.get('/v2/registration-via-invite', () => {
      return new Response(400, {}, { token: ['Invalid Token'] });
    });

    await visit(`/register-via-invite/${token}`);

    assert.dom('[data-test-token-error]').exists();

    assert.dom('[data-test-error-SvgIcon]').exists();

    assert.dom('[data-test-error-text]').hasText(t('somethingWentWrong'));

    assert.strictEqual(
      find('[data-test-error-helperText]').innerHTML,
      t('invalidTokenError', { htmlSafe: true }).toString()
    );
  });

  test('it redirects via-org-invite to error page when token is invalid', async function (assert) {
    const token = faker.string.alphanumeric({ length: 50 });

    this.server.get('/invite/:token', () => {
      return new Response(
        404,
        {},
        {
          detail: 'Not found.',
        }
      );
    });

    await visit(`/invite/${token}`);

    assert.dom('[data-test-token-error]').exists();

    assert.dom('[data-test-error-SvgIcon]').exists();

    assert.dom('[data-test-error-text]').hasText(t('somethingWentWrong'));

    assert.strictEqual(
      find('[data-test-error-helperText]').innerHTML,
      t('invalidTokenError', { htmlSafe: true }).toString()
    );
  });
});
