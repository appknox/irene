import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import ENUMS from 'irene/enums';

class NotificationsStub extends Service {
  error() {}
  success() {}
  info() {}
}

class MeStub extends Service {
  org = { is_admin: true };
}

function organizationStub({ registrationEnabled = true } = {}) {
  return class OrganizationStub extends Service {
    selected = { id: 1 };
    isCyodEnabled = true;
    isCyodRegistrationEnabled = registrationEnabled;
  };
}

module(
  'Integration | Component | project-settings/general-settings',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      this.owner.register('service:notifications', NotificationsStub);
      this.owner.register('service:me', MeStub);

      this.server.get('/profiles/:id/proxy_settings', (_, req) => ({
        id: req.params.id,
      }));

      this.server.get('/profiles/:id/api_scan_options', (_, req) => ({
        id: req.params.id,
      }));
      this.server.get('/organizations/:id/projects/:pid/teams', () => ({
        count: 0,
        next: null,
        previous: null,
        results: [],
      }));

      this.server.get('/projects/:id/collaborators', () => ({
        count: 0,
        next: null,
        previous: null,
        results: [],
      }));
    });

    // Each render needs its own project: the store rejects reusing an id.
    let nextProjectId = 1;

    async function renderFor(context, platform) {
      const store = context.owner.lookup('service:store');

      const project = store.createRecord('project', {
        id: nextProjectId++,
        platform,
        activeProfileId: 1,
      });

      context.set('project', project);

      await render(
        hbs`<ProjectSettings::GeneralSettings @project={{this.project}} />`
      );
    }

    test('an iOS project shows the CYOD section under the API filter', async function (assert) {
      this.owner.register('service:organization', organizationStub());

      await renderFor(this, ENUMS.PLATFORM.IOS);

      assert.dom('[data-test-orgSigningCert]').exists();

      assert
        .dom('[data-test-orgSigningCert-sectionTitle]')
        .hasTagName('h5', 'section heading sits level with Teams');

      // Sections in order: proxy | api filter | CYOD | teams | collaborators.
      const sections = this.element.querySelectorAll(
        '[data-test-projectSettings-generalSettings-root] > *'
      );

      const cyodIndex = [...sections].findIndex((el) =>
        el.querySelector('[data-test-orgSigningCert]')
      );

      const teamsIndex = [...sections].findIndex((el) =>
        el.textContent.includes('Teams')
      );

      assert.notStrictEqual(cyodIndex, -1, 'CYOD is one of the root sections');

      assert.ok(
        cyodIndex < teamsIndex,
        `CYOD (${cyodIndex}) renders above Teams (${teamsIndex})`
      );
    });

    // The CYOD divider lives in this template rather than inside the panel, so
    // hiding the panel without hiding the divider would leave a rule with
    // nothing under it. Counting dividers is the only way to catch that — the
    // panel's own tests cannot see a sibling they do not render.
    test('hiding the CYOD section takes its divider with it', async function (assert) {
      this.owner.register('service:organization', organizationStub());

      await renderFor(this, ENUMS.PLATFORM.IOS);

      const withCyod = this.element.querySelectorAll(
        '[data-test-ak-divider]'
      ).length;

      this.owner.unregister('service:organization');

      this.owner.register(
        'service:organization',
        organizationStub({ registrationEnabled: false })
      );

      await renderFor(this, ENUMS.PLATFORM.IOS);

      assert.dom('[data-test-orgSigningCert]').doesNotExist();

      assert.strictEqual(
        this.element.querySelectorAll('[data-test-ak-divider]').length,
        withCyod - 1,
        'exactly one divider goes with the section — none left dangling'
      );
    });
  }
);
