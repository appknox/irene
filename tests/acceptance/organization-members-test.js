import { module, test } from 'qunit';

import {
  click,
  visit,
  findAll,
  currentURL,
  fillIn,
  triggerEvent,
} from '@ember/test-helpers';

import { setupApplicationTest } from 'ember-qunit';
import { setupRequiredEndpoints } from '../helpers/acceptance-utils';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import { Response } from 'miragejs';
import Service from '@ember/service';
import dayjs from 'dayjs';

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

class WebsocketStub extends Service {
  async connect() {}

  async configure() {}
}

module('Acceptance | organization members', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    await setupRequiredEndpoints(this.server);

    const organizationMembers = this.server.createList(
      'organization-member',
      5
    );

    const users = this.server.createList('organization-user', 5);

    // 0 is member, 1 is owner, 2 is admin
    organizationMembers.forEach((orgMember, index) => {
      orgMember.update({
        role: index === 1 ? 0 : index === 3 ? 2 : 1,
      });
    });

    organizationMembers[4].update({
      is_active: false,
    });

    users[4].update({
      is_active: false,
    });

    const organizationInvitations = this.server.createList(
      'organization-invitation',
      3
    );

    organizationInvitations
      .filter((oi) => Boolean(oi.team))
      .forEach((oi) => {
        this.server.create('organization-team', { id: oi.team });
      });

    this.owner.register('service:integration', IntegrationStub);
    this.owner.register('service:websocket', WebsocketStub);

    this.setProperties({
      organizationInvitations,
    });
  });

  test.each(
    'test organization user invitation delete',
    [{ fail: false }, { fail: true }],
    async function (assert, { fail }) {
      const notify = this.owner.lookup('service:notifications');

      notify.setDefaultClearDuration(0);

      this.server.get('/organizations/:id/invitations', (schema) => {
        const results = schema.organizationInvitations.all().models;

        return { count: results.length, next: null, previous: null, results };
      });

      this.server.delete(
        '/organizations/:id/invitations/:inviteId',
        (schema, req) => {
          if (!fail) {
            schema.db.organizationInvitations.remove(req.params.inviteId);
          }

          return new Response(fail ? 500 : 204);
        }
      );

      this.server.get('/organizations/:id/users/:userId', (schema, req) => {
        return schema.organizationUsers.find(req.params.userId)?.toJSON();
      });

      this.server.get('/organizations/:id/teams/:teamId', (schema, req) => {
        return schema.organizationTeams.find(req.params.teamId)?.toJSON();
      });

      await visit('/organization/users');

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

      assert.dom('[data-test-ak-modal-header]').hasText(t('confirm'));

      assert
        .dom('[data-test-confirmbox-description]')
        .hasText(t('confirmBox.deleteInvitation'));

      assert
        .dom('[data-test-confirmbox-confirmBtn]')
        .exists()
        .isNotDisabled()
        .hasText(t('delete'));

      assert
        .dom('[data-test-confirmbox-cancelBtn]')
        .exists()
        .isNotDisabled()
        .hasText(t('cancel'));

      await click('[data-test-confirmbox-confirmBtn]');

      if (fail) {
        assert.strictEqual(
          findAll('[data-test-invitation-list-row]').length,
          this.organizationInvitations.length
        );

        assert.dom('[data-test-ak-modal-header]').exists();
        assert.dom('[data-test-confirmbox-confirmBtn]').exists();
      } else {
        assert.strictEqual(
          findAll('[data-test-invitation-list-row]').length,
          this.organizationInvitations.length - 1
        );

        assert.dom('[data-test-ak-modal-header]').doesNotExist();
        assert.dom('[data-test-confirmbox-confirmBtn]').doesNotExist();
      }
    }
  );

  test('test organization user invitation list reload', async function (assert) {
    const notify = this.owner.lookup('service:notifications');

    notify.setDefaultClearDuration(0);

    // remove all invites
    this.server.db.organizationInvitations.remove();

    const createOrgInvite = ({ email }) =>
      this.server.create('organization-invitation', { email, team: null });

    this.server.get('/organizations/:id/invitations', (schema) => {
      const results = schema.organizationInvitations.all().models;
      return { count: results.length, next: null, previous: null, results };
    });

    this.server.post('/organizations/:id/invitations', (_, req) => {
      const data = JSON.parse(req.requestBody);

      const invite = createOrgInvite(data);

      return invite.toJSON();
    });

    this.server.get('/organizations/:id/users/:userId', (schema, req) => {
      const user = schema.organizationUsers.find(req.params.userId);

      return user?.toJSON();
    });

    this.server.get('/organizations/:id/teams/:teamId', (schema, req) => {
      const user = schema.organizationTeams.find(req.params.teamId);

      return user?.toJSON();
    });

    await visit('/organization/users');

    assert
      .dom('[data-test-invite-member-btn]')
      .isNotDisabled()
      .hasText('Invite Users');

    assert.dom('[data-test-invitation-list-title]').doesNotExist();
    assert.dom('[data-test-invitation-list]').doesNotExist();

    await click('[data-test-invite-member-btn]');

    const emailText = 'test@mail.com, test1@mail.com';

    assert
      .dom('[data-test-invite-member-input]')
      .exists()
      .isNotDisabled()
      .hasNoValue();

    await fillIn('[data-test-invite-member-input]', emailText);

    assert.dom('[data-test-invite-member-input]').hasValue(emailText);

    await click('[data-test-send-invite-btn]');

    assert
      .dom('[data-test-invitation-list-title]')
      .exists()
      .hasText(t('pendingInvitations'));

    assert.dom('[data-test-invitation-list]').exists();

    const contentRows = findAll('[data-test-invitation-list-row]');

    assert.strictEqual(contentRows.length, 2);

    const firstRow = contentRows[0].querySelectorAll(
      '[data-test-invitation-list-cell]'
    );

    assert.dom(firstRow[0]).hasText('test@mail.com');
    assert.dom(firstRow[1]).hasText(t('organization'));

    assert
      .dom(firstRow[2])
      .hasText(dayjs(this.organizationInvitations[0].created_on).fromNow());

    assert
      .dom('[data-test-invitation-resend-btn]', firstRow[3])
      .exists()
      .isNotDisabled();
  });

  test('test organization user inactive user checkbox', async function (assert) {
    this.server.get('/organizations/:id/invitations', () => {
      return { count: 0, next: null, previous: null, results: [] };
    });

    this.server.get('/organizations/:id/members', (schema, req) => {
      const showOnlyActive = req.queryParams.is_active
        ? JSON.parse(req.queryParams.is_active)
        : req.queryParams.is_active;

      this.set('is_active', showOnlyActive);

      const results = showOnlyActive
        ? schema.organizationMembers.where((it) => it.is_active).models
        : schema.organizationMembers.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    this.server.get('/organizations/:id/users/:userId', (schema, req) => {
      const user = schema.organizationUsers.find(req.params.userId);

      return user?.toJSON();
    });

    await visit('/organization/users');

    let contentRows = findAll('[data-test-org-user-row]');

    // 4 active members created in this test and 1 for current user
    assert.strictEqual(contentRows.length, 5);

    assert.true(this.is_active);

    await click('[data-test-inactive-user-label]');

    assert.dom('[data-test-inactive-user-checkbox]').isChecked();

    assert.ok(currentURL().includes('show_inactive_user=true'));

    contentRows = findAll('[data-test-org-user-row]');

    // 4 active, 1 inactive and 1 for current user
    assert.strictEqual(contentRows.length, 6);

    assert.strictEqual(typeof this.is_active, 'undefined');

    await click('[data-test-inactive-user-label]');

    assert.dom('[data-test-inactive-user-checkbox]').isNotChecked();

    contentRows = findAll('[data-test-org-user-row]');

    // 4 active members and 1 for current user
    assert.strictEqual(contentRows.length, 5);

    assert.notOk(currentURL().includes('show_inactive_user=true'));
  });

  test('test organization user search', async function (assert) {
    this.server.get('/organizations/:id/invitations', () => {
      return { count: 0, next: null, previous: null, results: [] };
    });

    this.server.get('/organizations/:id/members', (schema, req) => {
      this.set('query', req.queryParams.q);

      const results = schema.organizationMembers.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    this.server.get('/organizations/:id/users/:userId', (schema, req) => {
      const user = schema.organizationUsers.find(req.params.userId);

      return user?.toJSON();
    });

    await visit('/organization/users');

    const contentRows = findAll('[data-test-org-user-row]');

    // 4 active, 1 inactive and 1 for current user
    assert.strictEqual(contentRows.length, 6);

    assert
      .dom('[data-test-user-search-input]')
      .exists()
      .isNotDisabled()
      .hasNoValue();

    assert.strictEqual(this.query, '');

    await fillIn('[data-test-user-search-input]', 'test');
    await triggerEvent('[data-test-user-search-input]', 'keyup');

    assert.dom('[data-test-user-search-input]').hasValue('test');

    assert.strictEqual(this.query, 'test');
    assert.ok(currentURL().includes('user_query=test'));
  });
});
