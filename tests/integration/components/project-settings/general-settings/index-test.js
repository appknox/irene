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

/**
 * Registers an organization service whose `selected` is a mirage-created
 * organization, so the signing-certificate URLs it drives point at a real
 * record rather than a literal id.
 */
/**
 * Registers a `me` whose org membership carries the given role trait. The CYOD
 * section is limited to admins and owners, so the role decides whether the
 * section — and the divider that introduces it — renders at all.
 */
function setupMe(context, ...traits) {
  const orgMe = context.server.create('organization-me', ...traits);

  class MeStub extends Service {
    org = orgMe;
  }

  context.owner.unregister('service:me');
  context.owner.register('service:me', MeStub);

  return orgMe;
}

function setupOrganization(context, { registrationEnabled = true } = {}) {
  const organization = context.server.create('organization', 'cyodEnabled');

  class OrganizationStub extends Service {
    selected = organization;
    isCyodEnabled = true;
    isCyodRegistrationEnabled = registrationEnabled;
  }

  context.owner.unregister('service:organization');
  context.owner.register('service:organization', OrganizationStub);

  return organization;
}

module(
  'Integration | Component | project-settings/general-settings',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      this.owner.register('service:notifications', NotificationsStub);
      setupMe(this, 'admin');

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

    async function renderFor(context, platform) {
      const store = context.owner.lookup('service:store');
      const profile = context.server.create('profile');

      const project = store.push(
        store.normalize(
          'project',
          context.server
            .create('project', {
              platform,
              active_profile_id: profile.id,
            })
            .toJSON()
        )
      );

      context.set('project', project);

      await render(
        hbs`<ProjectSettings::GeneralSettings @project={{this.project}} />`
      );
    }

    test('an iOS project shows the CYOD section under the API filter', async function (assert) {
      setupOrganization(this);

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

    test('a plain member gets no CYOD section', async function (assert) {
      setupOrganization(this);
      setupMe(this, 'member');

      await renderFor(this, ENUMS.PLATFORM.IOS);

      assert
        .dom('[data-test-orgSigningCert]')
        .doesNotExist('signing certificates are an admin/owner surface');

      assert.dom('[data-test-orgSigningCert-sectionTitle]').doesNotExist();
    });

    // The CYOD divider lives in this template rather than inside the panel, so
    // hiding the panel without hiding the divider would leave a rule with
    // nothing under it. Counting dividers is the only way to catch that — the
    // panel's own tests cannot see a sibling they do not render.
    test('hiding the CYOD section takes its divider with it', async function (assert) {
      setupOrganization(this);

      await renderFor(this, ENUMS.PLATFORM.IOS);

      const withCyod = this.element.querySelectorAll(
        '[data-test-ak-divider]'
      ).length;

      setupOrganization(this, { registrationEnabled: false });

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
