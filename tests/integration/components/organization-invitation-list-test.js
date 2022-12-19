import { render, findAll, find, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import dayjs from 'dayjs';
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
  'Integration | Component | organization-invitation-list',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    hooks.beforeEach(async function () {
      this.server.createList('organization', 1);

      const organizationInvitations = this.server.createList(
        'organization-invitation',
        3
      );

      const [organizationTeam] = this.server.createList('organization-team', 1);
      const users = this.server.createList('organization-user', 3);

      organizationInvitations.forEach((orgInvite, index) => {
        orgInvite.update({
          team: index === 1 ? organizationTeam.id : null,
        });
      });

      await this.owner.lookup('service:organization').load();

      this.setProperties({
        organization: this.owner.lookup('service:organization').selected,
        organizationInvitations,
        organizationTeam,
        users,
      });

      this.owner.register('service:me', OrganizationMeStub);
      this.owner.register('service:notifications', NotificationsStub);
    });

    test('it renders organization user invitation list', async function (assert) {
      this.server.get('/organizations/:id/invitations', (schema) => {
        return schema.organizationInvitations.all().models;
      });

      this.server.get('/organizations/:id/users/:userId', (schema, req) => {
        const user = schema.organizationUsers.find(req.params.userId);

        return user?.toJSON();
      });

      this.server.get('/organizations/:id/teams/:teamId', (schema, req) => {
        const user = schema.organizationTeams.find(req.params.teamId);

        return user?.toJSON();
      });

      await render(hbs`
        <OrganizationInvitationList @organization={{this.organization}}>
          <:headerContent>
            <h5 data-test-invitation-list-title>
              {{t 'pendingInvitations'}}
            </h5>
          </:headerContent>
        </OrganizationInvitationList>
      `);

      assert
        .dom('[data-test-invitation-list-title]')
        .exists()
        .hasText('t:pendingInvitations:()');

      assert.dom('[data-test-invitation-list]').exists();

      const headerRow = find(
        '[data-test-invitation-list-thead] tr'
      ).querySelectorAll('th');

      // assert header row
      assert.dom(headerRow[0]).hasText('t:email:()');
      assert.dom(headerRow[1]).hasText('t:inviteType:()');
      assert.dom(headerRow[2]).hasText('t:invitedOn:()');
      assert.dom(headerRow[3]).hasText('t:resend:()');
      assert.dom(headerRow[4]).hasText('t:delete:()');

      const contentRows = findAll('[data-test-invitation-list-row]');

      assert.strictEqual(
        contentRows.length,
        this.organizationInvitations.length
      );

      // sanity check first row
      const firstRow = contentRows[0].querySelectorAll(
        '[data-test-invitation-list-cell]'
      );

      assert.dom(firstRow[0]).hasText(this.organizationInvitations[0].email);
      assert.dom(firstRow[1]).hasText('t:organization:()');

      assert
        .dom(firstRow[2])
        .hasText(dayjs(this.organizationInvitations[0].created_on).fromNow());

      assert
        .dom('[data-test-invitation-resend-btn]', firstRow[3])
        .exists()
        .isNotDisabled();

      assert
        .dom('[data-test-invitation-delete-btn]', firstRow[4])
        .exists()
        .isNotDisabled();

      // sanity check second row
      const secondRow = contentRows[1].querySelectorAll(
        '[data-test-invitation-list-cell]'
      );

      assert.dom(secondRow[0]).hasText(this.organizationInvitations[1].email);

      assert
        .dom('[data-test-invite-type-text]', secondRow[1])
        .exists()
        .hasText('t:team:()');

      assert
        .dom('[data-test-invite-type-link]', secondRow[1])
        .exists()
        .hasText(this.organizationTeam.name);
    });

    test.each(
      'test organization user invitation resend',
      [{ fail: false }, { fail: true }],
      async function (assert, { fail }) {
        this.server.get('/organizations/:id/invitations', (schema) => {
          return schema.organizationInvitations.all().models;
        });

        this.server.post(
          '/organizations/:id/invitations/:inviteId/resend',
          () => {
            return fail ? new Response(500) : {};
          }
        );

        this.server.get('/organizations/:id/users/:userId', (schema, req) => {
          const user = schema.organizationUsers.find(req.params.userId);

          return user?.toJSON();
        });

        this.server.get('/organizations/:id/teams/:teamId', (schema, req) => {
          const user = schema.organizationTeams.find(req.params.teamId);

          return user?.toJSON();
        });

        await render(hbs`
            <OrganizationInvitationList @organization={{this.organization}} />
        `);

        assert.dom('[data-test-invitation-list]').exists();

        const contentRows = findAll('[data-test-invitation-list-row]');

        const firstRow = contentRows[0].querySelectorAll(
          '[data-test-invitation-list-cell]'
        );

        assert
          .dom('[data-test-invitation-resend-btn]', firstRow[3])
          .exists()
          .isNotDisabled();

        await click(`#${firstRow[3].id} [data-test-invitation-resend-btn]`);

        assert.dom('[data-test-ak-modal-header]').hasText('t:confirm:()');

        assert
          .dom('[data-test-confirmbox-description]')
          .hasText('t:confirmBox.resendInvitation:()');

        assert
          .dom('[data-test-confirmbox-confirmBtn]')
          .exists()
          .isNotDisabled()
          .hasText('t:resend:()');

        assert
          .dom('[data-test-confirmbox-cancelBtn]')
          .exists()
          .isNotDisabled()
          .hasText('t:cancel:()');

        await click('[data-test-confirmbox-confirmBtn]');

        const notify = this.owner.lookup('service:notifications');

        if (fail) {
          assert.strictEqual(notify.errorMsg, 't:pleaseTryAgain:()');

          assert.dom('[data-test-ak-modal-header]').exists();
          assert.dom('[data-test-confirmbox-confirmBtn]').exists();
        } else {
          assert.strictEqual(notify.successMsg, 't:invitationReSent:()');

          assert.dom('[data-test-ak-modal-header]').doesNotExist();
          assert.dom('[data-test-confirmbox-confirmBtn]').doesNotExist();
        }
      }
    );

    test.each(
      'test organization user invitation delete',
      [{ fail: false }, { fail: true }],
      async function (assert, { fail }) {
        this.server.get('/organizations/:id/invitations', (schema) => {
          return schema.organizationInvitations.all().models;
        });

        this.server.delete('/organizations/:id/invitations/:inviteId', () => {
          return fail ? new Response(500) : {};
        });

        this.server.get('/organizations/:id/users/:userId', (schema, req) => {
          const user = schema.organizationUsers.find(req.params.userId);

          return user?.toJSON();
        });

        this.server.get('/organizations/:id/teams/:teamId', (schema, req) => {
          const user = schema.organizationTeams.find(req.params.teamId);

          return user?.toJSON();
        });

        await render(hbs`
            <OrganizationInvitationList @organization={{this.organization}} />
        `);

        assert.dom('[data-test-invitation-list]').exists();

        const contentRows = findAll('[data-test-invitation-list-row]');

        const firstRow = contentRows[0].querySelectorAll(
          '[data-test-invitation-list-cell]'
        );

        assert
          .dom('[data-test-invitation-delete-btn]', firstRow[4])
          .exists()
          .isNotDisabled();

        await click(`#${firstRow[4].id} [data-test-invitation-delete-btn]`);

        assert.dom('[data-test-ak-modal-header]').hasText('t:confirm:()');

        assert
          .dom('[data-test-confirmbox-description]')
          .hasText('t:confirmBox.deleteInvitation:()');

        assert
          .dom('[data-test-confirmbox-confirmBtn]')
          .exists()
          .isNotDisabled()
          .hasText('t:delete:()');

        assert
          .dom('[data-test-confirmbox-cancelBtn]')
          .exists()
          .isNotDisabled()
          .hasText('t:cancel:()');

        await click('[data-test-confirmbox-confirmBtn]');

        const notify = this.owner.lookup('service:notifications');

        if (fail) {
          assert.strictEqual(notify.errorMsg, 't:pleaseTryAgain:()');

          assert.strictEqual(
            findAll('[data-test-invitation-list-row]').length,
            this.organizationInvitations.length
          );

          assert.dom('[data-test-ak-modal-header]').exists();
          assert.dom('[data-test-confirmbox-confirmBtn]').exists();
        } else {
          assert.strictEqual(notify.successMsg, 't:invitationDeleted:()');

          assert.strictEqual(
            findAll('[data-test-invitation-list-row]').length,
            this.organizationInvitations.length - 1
          );

          assert.dom('[data-test-ak-modal-header]').doesNotExist();
          assert.dom('[data-test-confirmbox-confirmBtn]').doesNotExist();
        }
      }
    );
  }
);
