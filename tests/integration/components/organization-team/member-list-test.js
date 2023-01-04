import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import {
  click,
  render,
  findAll,
  fillIn,
  triggerEvent,
} from '@ember/test-helpers';
import { setupIntl } from 'ember-intl/test-support';
import { hbs } from 'ember-cli-htmlbars';
import { Response } from 'miragejs';

import Service from '@ember/service';

class OrganizationMeStub extends Service {
  org = {
    is_owner: true,
    is_admin: true,
    is_member: false,
  };
}

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
  'Integration | Component | organization-team/member-list',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    hooks.beforeEach(async function () {
      this.server.createList('organization', 1);

      const organizationUsers = this.server.createList('organization-user', 2);

      const store = this.owner.lookup('service:store');
      const [team] = this.server.createList('organization-team', 1);

      const organizationTeam = store.createRecord('organization-team', {
        id: team.id,
        name: team.name,
        membersCount: team.members_count,
        projectsCount: team.projects_count,
        organization: team.organization,
      });

      await this.owner.lookup('service:organization').load();

      this.setProperties({
        organization: this.owner.lookup('service:organization').selected,
        organizationTeam,
        organizationUsers,
      });

      this.owner.register('service:me', OrganizationMeStub);
      this.owner.register('service:notifications', NotificationsStub);
    });

    test('it renders member-list', async function (assert) {
      this.set('handleActiveAction', () => {});

      this.server.get('/organizations/:id/users/:userId', (schema, req) => {
        return schema.organizationUsers.find(req.params.userId)?.toJSON();
      });

      await render(
        hbs(
          `<OrganizationTeam::MemberList @members={{this.organizationTeam.members}} @organization={{this.organization}} @team={{this.organizationTeam}} @handleActiveAction={{this.handleActiveAction}} />`
        )
      );

      assert.dom('[data-test-teamUserList-title]').hasText('t:users:()');

      assert
        .dom('[data-test-teamUserList-description]')
        .hasText('t:teamUsersDesc:()');

      assert
        .dom('[data-test-teamUserList-addUserBtn]')
        .isNotDisabled()
        .hasText('t:addUser:()');

      const userHeaderRows = findAll('[data-test-teamUserList-thead] th');

      assert.dom(userHeaderRows[0]).hasText('t:user:()');
      assert.dom(userHeaderRows[1]).hasText('t:email:()');
      assert.dom(userHeaderRows[2]).hasText('t:action:()');

      const userContentRows = findAll('[data-test-teamUserList-row]');

      assert.strictEqual(userContentRows.length, this.organizationUsers.length);

      const userContentRow = userContentRows[0].querySelectorAll(
        '[data-test-teamUserList-cell]'
      );

      assert.dom(userContentRow[0]).hasText(this.organizationUsers[0].username);
      assert.dom(userContentRow[1]).hasText(this.organizationUsers[0].email);

      assert
        .dom('[data-test-teamUserList-actionBtn]', userContentRow[2])
        .isNotDisabled();
    });

    // TODO: remove skip once ui is uncommmented
    test.skip('test member-list search', async function (assert) {
      this.set('handleActiveAction', () => {});

      this.server.get(
        '/organizations/:id/teams/:teamId/members',
        (schema, req) => {
          this.set('query', req.queryParams.q);

          return schema.organizationUsers.all().models;
        }
      );

      this.server.get('/organizations/:id/users/:userId', (schema, req) => {
        return schema.organizationUsers.find(req.params.userId)?.toJSON();
      });

      await render(
        hbs(
          `<OrganizationTeam::MemberList @members={{this.organizationTeam.members}} @organization={{this.organization}} @team={{this.organizationTeam}} @handleActiveAction={{this.handleActiveAction}} />`
        )
      );

      assert.dom('[data-test-teamUserList-title]').hasText('t:users:()');
      assert.dom('[data-test-teamUserList-searchInput]').hasNoValue();
      assert.notOk(this.query);

      await fillIn('[data-test-teamUserList-searchInput]', 'test');
      await triggerEvent('[data-test-teamUserList-searchInput]', 'keyup');

      assert.dom('[data-test-teamUserList-searchInput]').hasValue(this.query);
      assert.strictEqual(this.query, 'test');
    });

    test.each(
      'test member-list user remove',
      [{ fail: false }, { fail: true }],
      async function (assert, { fail }) {
        this.set('handleActiveAction', () => {});

        this.server.get('/organizations/:id/users/:userId', (schema, req) => {
          return schema.organizationUsers.find(req.params.userId)?.toJSON();
        });

        this.server.delete(
          '/organizations/:id/teams/:teamId/members/:memId',
          () => {
            return new Response(fail ? 500 : 204);
          }
        );

        await render(
          hbs(
            `<OrganizationTeam::MemberList @members={{this.organizationTeam.members}} @organization={{this.organization}} @team={{this.organizationTeam}} @handleActiveAction={{this.handleActiveAction}} />`
          )
        );

        const userContentRows = findAll('[data-test-teamUserList-row]');

        assert.strictEqual(
          userContentRows.length,
          this.organizationUsers.length
        );

        const userContentRow = userContentRows[0].querySelectorAll(
          '[data-test-teamUserList-cell]'
        );

        assert
          .dom('[data-test-teamUserList-actionBtn]', userContentRow[2])
          .isNotDisabled();

        await click(
          `#${userContentRow[2].id} [data-test-teamUserList-actionBtn]`
        );

        assert.dom('[data-test-ak-modal-header]').hasText('t:confirm:()');

        assert
          .dom('[data-test-confirmBox-cancelBtn]')
          .isNotDisabled()
          .hasText('t:cancel:()');

        assert
          .dom('[data-test-confirmBox-confirmBtn]')
          .isNotDisabled()
          .hasText('T:remove:()');

        assert
          .dom('[data-test-form-label]')
          .hasText('t:promptBox.removeMemberPrompt.description:()');

        assert.dom('[data-test-teamUserList-promptInput]').hasNoValue();

        // error checks
        const notify = this.owner.lookup('service:notifications');

        await click('[data-test-confirmBox-confirmBtn]');

        assert.strictEqual(notify.errorMsg, 't:enterRightUserName:()');

        await fillIn('[data-test-teamUserList-promptInput]', 'wrongName');

        await click('[data-test-confirmBox-confirmBtn]');

        assert.strictEqual(notify.errorMsg, 't:enterRightUserName:()');

        // correct input

        await fillIn(
          '[data-test-teamUserList-promptInput]',
          this.organizationUsers[0].username
        );

        await click('[data-test-confirmBox-confirmBtn]');

        const latestRows = findAll('[data-test-teamUserList-row]');

        if (fail) {
          assert.strictEqual(notify.errorMsg, 't:pleaseTryAgain:()');

          assert.strictEqual(latestRows.length, this.organizationUsers.length);
        } else {
          assert.strictEqual(notify.successMsg, 't:teamMemberRemoved:()');

          assert.strictEqual(
            latestRows.length,
            this.organizationUsers.length - 1
          );
        }
      }
    );
  }
);
