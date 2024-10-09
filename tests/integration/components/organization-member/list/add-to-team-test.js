import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import {
  render,
  findAll,
  fillIn,
  triggerEvent,
  click,
} from '@ember/test-helpers';
import { setupIntl, t } from 'ember-intl/test-support';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import { Response } from 'miragejs';

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
  'Integration | Component | organization-member/list/add-to-team',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    hooks.beforeEach(async function () {
      this.server.createList('organization', 1);

      const store = this.owner.lookup('service:store');

      const organizationMe = store.createRecord('organization-me', {
        is_owner: true,
        is_admin: true,
      });
      class OrganizationMeStub extends Service {
        org = organizationMe;
      }

      const organizationTeams = this.server.createList('organization-team', 3);

      const member = this.server.create('organization-member');

      const organizationUser = this.server.create('organization-user');

      const normalizedOrganizationMember = store.normalize(
        'organization-member',
        member.toJSON()
      );

      await this.owner.lookup('service:organization').load();

      this.setProperties({
        organization: this.owner.lookup('service:organization').selected,
        member: store.push(normalizedOrganizationMember),
        organizationUser,
        organizationTeams,
        handleBackToTeamDetail: () => {},
      });

      this.owner.register('service:me', OrganizationMeStub);
      this.owner.register('service:notifications', NotificationsStub);
    });

    test('it renders add-to-team component', async function (assert) {
      this.server.get('/organizations/:id/users/:userId', (schema, req) => {
        const user = schema.organizationUsers.find(req.params.userId);

        return user?.toJSON();
      });

      this.server.get('/organizations/:id/teams', (schema) => {
        const results = schema.organizationTeams.all().models;

        return { count: results.length, next: null, previous: null, results };
      });

      await render(hbs`
        <OrganizationMember::List::AddToTeam 
          @member={{this.member}} 
          @organization={{this.organization}} 
          @handleBackToTeamDetail={{this.handleBackToTeamDetail}} 
        />
      `);

      assert.dom('[data-test-addToTeam-titleBtn]').exists();

      assert.dom('[data-test-teamList-table]').exists();

      assert.dom('[data-test-teamList-thead]').exists();

      const headerRow = findAll('[data-test-teamList-thead] th');

      assert.dom(headerRow[0]).hasText(t('teamName'));
      assert.dom(headerRow[1]).hasText(t('action'));

      const contentRows = findAll('[data-test-teamList-row]');

      const contentRow = contentRows[0].querySelectorAll(
        '[data-test-teamList-cell]'
      );

      assert.dom(contentRow[0]).hasText(this.organizationTeams[0].name);
      assert
        .dom(contentRow[1].querySelector('[data-test-addToTeam-btn]'))
        .isNotDisabled();
    });

    test('it renders add-to-team search', async function (assert) {
      this.server.get('/organizations/:id/users/:userId', (schema, req) => {
        const user = schema.organizationUsers.find(req.params.userId);

        return user?.toJSON();
      });

      this.server.get('/organizations/:id/teams', (schema, req) => {
        this.set('query', req.queryParams.q);

        const results = schema.organizationTeams.all().models;

        return { count: results.length, next: null, previous: null, results };
      });

      await render(hbs`
        <OrganizationMember::List::AddToTeam 
          @member={{this.member}} 
          @organization={{this.organization}} 
          @handleBackToTeamDetail={{this.handleBackToTeamDetail}} 
        />
      `);

      assert
        .dom('[data-test-teamList-searchInput]')
        .isNotDisabled()
        .hasNoValue();

      assert.notOk(this.query);

      await fillIn('[data-test-teamList-searchInput]', 'test');
      await triggerEvent('[data-test-teamList-searchInput]', 'keyup');

      assert.dom('[data-test-teamList-searchInput]').hasValue(this.query);
    });

    test.each(
      'test add-to-team add user action',
      [{ fail: false }, { fail: true }],
      async function (assert, { fail }) {
        this.server.get('organizations/:id/teams', (schema) => {
          const results = schema.organizationTeams.all().models;

          return { count: results.length, next: null, previous: null, results };
        });

        this.server.get('/organizations/:id/users/:userId', (schema, req) => {
          const user = schema.organizationUsers.find(req.params.userId);

          return user?.toJSON();
        });

        this.server.put(
          '/organizations/:id/teams/:teamId/members/:memId',
          (schema, req) => {
            schema.db.organizationTeams.remove(req.params.teamId);

            return fail ? new Response(500) : { id: req.params.memId };
          }
        );

        this.server.get('/organizations/:id/teams/:teamId', (schema, req) =>
          schema.organizationTeams.find(`${req.params.id}`)?.toJSON()
        );

        await render(hbs`
          <OrganizationMember::List::AddToTeam 
            @member={{this.member}} 
            @organization={{this.organization}} 
            @handleBackToTeamDetail={{this.handleBackToTeamDetail}} 
          />
        `);

        assert.dom('[data-test-teamList-table]').exists();

        const contentRows = findAll('[data-test-teamList-row]');

        assert.strictEqual(contentRows.length, this.organizationTeams.length);

        const contentRow = contentRows[0].querySelectorAll(
          '[data-test-teamList-cell]'
        );

        assert.dom(contentRow[1]).exists();

        assert
          .dom(contentRow[1].querySelector('[data-test-addToTeam-btn]'))
          .exists();

        await click(contentRow[1].querySelector('[data-test-addToTeam-btn]'));

        const notify = this.owner.lookup('service:notifications');

        const latestRows = findAll('[data-test-teamList-row]');

        if (fail) {
          assert.strictEqual(notify.errorMsg, t('pleaseTryAgain'));
          assert.strictEqual(latestRows.length, this.organizationTeams.length);
        } else {
          assert.strictEqual(notify.successMsg, t('teamMemberAdded'));

          assert.strictEqual(
            latestRows.length,
            this.organizationTeams.length - 1
          );
        }
      }
    );
  }
);
