import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import {
  click,
  fillIn,
  findAll,
  render,
  triggerEvent,
} from '@ember/test-helpers';
import { setupIntl } from 'ember-intl/test-support';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import dayjs from 'dayjs';

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
  'Integration | Component | organization-member/list/member-details',

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

      const member = this.server.create('organization-member');

      const organizationTeams = this.server.createList('organization-team', 3);

      const organizationUser = this.server.create('organization-user');

      const normalizedOrganizationMember = store.normalize(
        'organization-member',
        member.toJSON()
      );

      await this.owner.lookup('service:organization').load();

      this.setProperties({
        organization: this.owner.lookup('service:organization').selected,
        member: store.push(normalizedOrganizationMember),
        organizationTeams,
        organizationUser,
        handleAddToTeam: () => {},
        handleUserDetailClose: () => {},
      });

      this.owner.register('service:me', OrganizationMeStub);
      this.owner.register('service:notifications', NotificationsStub);
    });

    test.each(
      'it renders member-details description',
      [{ is_owner: true }, { is_owner: false }],
      async function (assert, { is_owner }) {
        const me = this.owner.lookup('service:me');
        me.org.is_owner = is_owner;

        await render(hbs`
        <OrganizationMember::List::MemberDetails 
          @member={{this.member}}
          @organization={{this.organization}}
          @showUserDetailsView={{true}}
          @handleAddToTeam={{this.handleAddToTeam}}
          @handleUserDetailClose={{this.handleUserDetailClose}}
        />
      `);

        assert.dom('[data-test-member-details]').exists();

        assert.dom('[data-test-selected-user-details]').exists();

        assert.dom('[data-test-selected-user-label]').hasText('t:user:()');

        if (is_owner) {
          assert.dom('[data-test-member-role-dropdown]').exists();

          if (this.member.role === 'admin') {
            assert
              .dom('[data-test-member-role-dropdown]')
              .hasText('t:admin:()');
          }

          if (this.member.role === 'member') {
            assert
              .dom('[data-test-member-role-dropdown]')
              .hasText('t:member:()');
          }

          if (this.member.role === 'owner') {
            assert
              .dom('[data-test-member-role-dropdown]')
              .hasText('t:owner:()');
          }
        } else {
          assert.dom('[data-test-member-role-dropdown]').doesNotExist();

          if (this.member.role === 'admin') {
            assert.dom('[data-test-member-role-text]').hasText('t:admin:()');
          }
        }

        if (this.member.last_logged_in == null) {
          assert.dom('[data-test-org-member-lastLogin]').hasText('t:never:()');
        } else {
          assert
            .dom('[data-test-org-member-lastLogin]')
            .hasText(dayjs(this.member.last_logged_in).format('MMM DD, YYYY'));
        }
      }
    );

    test('it renders team table for associated member', async function (assert) {
      this.server.get('/organizations/:id/users/:userId', (schema, req) => {
        const user = schema.organizationUsers.find(req.params.userId);

        return user?.toJSON();
      });

      this.server.get('/organizations/:id/teams', (schema) => {
        const results = schema.organizationTeams.all().models;

        return { count: results.length, next: null, previous: null, results };
      });

      await render(hbs`
        <OrganizationMember::List::MemberDetails 
          @member={{this.member}}
          @organization={{this.organization}}
          @showUserDetailsView={{true}}
          @handleAddToTeam={{this.handleAddToTeam}}
          @handleUserDetailClose={{this.handleUserDetailClose}}
        />
      `);

      assert.dom('[data-test-teamList-thead]').exists();

      const headerRow = findAll('[data-test-teamList-thead] th');

      assert.dom(headerRow[0]).hasText('t:teamName:()');
      assert.dom(headerRow[1]).hasText('t:action:()');

      const contentRows = findAll('[data-test-teamList-row]');

      const contentRow = contentRows[0].querySelectorAll(
        '[data-test-teamList-cell]'
      );

      assert.dom(contentRow[0]).hasText(this.organizationTeams[0].name);
      assert
        .dom(contentRow[1].querySelector('[data-test-remove-user]'))
        .exists()
        .isNotDisabled();
    });

    test('remove-user button action test', async function (assert) {
      this.server.get('/organizations/:id/users/:userId', (schema, req) => {
        const user = schema.organizationUsers.find(req.params.userId);

        return user?.toJSON();
      });

      this.server.get('/organizations/:id/teams', (schema) => {
        const results = schema.organizationTeams.all().models;

        return { count: results.length, next: null, previous: null, results };
      });

      await render(hbs`
        <OrganizationMember::List::MemberDetails 
          @member={{this.member}}
          @organization={{this.organization}}
          @showUserDetailsView={{true}}
          @handleAddToTeam={{this.handleAddToTeam}}
          @handleUserDetailClose={{this.handleUserDetailClose}}
        />
      `);

      const contentRows = findAll('[data-test-teamList-row]');

      const contentRow = contentRows[0].querySelectorAll(
        '[data-test-teamList-cell]'
      );

      assert
        .dom(contentRow[1].querySelector('[data-test-remove-user]'))
        .exists()
        .isNotDisabled();

      await click(contentRow[1].querySelector('[data-test-remove-user]'));

      assert
        .dom('[data-test-confirmbox-description]')
        .hasText('t:confirmBox.removeUser:()');

      assert
        .dom('[data-test-confirmbox-confirmBtn]')
        .isNotDisabled()
        .hasText('T:remove:()');

      assert
        .dom('[data-test-confirmbox-cancelBtn]')
        .isNotDisabled()
        .hasText('t:cancel:()');

      await click('[data-test-confirmbox-confirmBtn]');

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(notify.successMsg, 't:teamMemberRemoved:()');
    });

    test('search action test for add user list', async function (assert) {
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
        <OrganizationMember::List::MemberDetails 
          @member={{this.member}}
          @organization={{this.organization}}
          @showUserDetailsView={{true}}
          @handleAddToTeam={{this.handleAddToTeam}}
          @handleUserDetailClose={{this.handleUserDetailClose}}
        />
      `);

      assert
        .dom('[data-test-addUserList-searchInput]')
        .isNotDisabled()
        .hasNoValue();

      assert.notOk(this.query);

      await fillIn('[data-test-addUserList-searchInput]', 'test');
      await triggerEvent('[data-test-addUserList-searchInput]', 'keyup');

      assert.dom('[data-test-addUserList-searchInput]').hasValue(this.query);
    });
  }
);
