import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';

class RouterStub extends Service {
  lastRoute = null;

  transitionTo(route) {
    this.lastRoute = route;
  }

  hasRoute() {
    return true;
  }

  urlFor() {
    return '';
  }

  isActive() {
    return false;
  }

  on() {}

  off() {}
}

class NotificationsStub extends Service {
  error() {}
  success() {}
}

module(
  'Integration | Component | offensive-security-wrapper',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      this.server.createList('organization', 1);

      this.server.get('/v2/organizations/me', () => ({
        is_owner: true,
        is_admin: true,
      }));

      this.server.get('/v2/submissions', () => ({
        count: 0,
        results: [],
      }));

      const store = this.owner.lookup('service:store');
      const organizationMe = store.createRecord('organization-me', {
        is_owner: true,
        is_admin: true,
      });

      class OrganizationMeStub extends Service {
        org = organizationMe;
      }

      this.owner.register('service:me', OrganizationMeStub);
      this.owner.register('service:notifications', NotificationsStub);

      this.owner.unregister('service:router');
      this.owner.register('service:router', RouterStub);

      this.set('user', { username: 'testuser' });
    });

    test('it renders TopNav with New Assessment button and clicking it transitions route', async function (assert) {
      await render(hbs`
        <OffensiveSecurityWrapper @user={{this.user}}>
          <div data-test-main-content>Main Body</div>
        </OffensiveSecurityWrapper>
      `);

      assert.dom('[data-test-main-content]').hasText('Main Body');
      assert
        .dom('[data-test-offensiveSecurity-topNav-uploadLead]')
        .hasText('Upload an App');
      assert
        .dom('[data-test-topNav-newAssessmentBtn]')
        .hasText('New Assessment');

      await click('[data-test-topNav-newAssessmentBtn]');

      const router = this.owner.lookup('service:router');
      assert.strictEqual(
        router.lastRoute,
        'authenticated.offensive-security.new-assessment'
      );
    });
  }
);
