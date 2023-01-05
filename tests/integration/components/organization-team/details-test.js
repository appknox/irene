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

module('Integration | Component | organization-team/details', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    this.server.createList('organization', 1);

    const organizationProjects = this.server.createList(
      'organization-project',
      2
    );

    const projects = this.server.createList('project', 2);
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

    const organizationInvitations = this.server.createList(
      'organization-invitation',
      2
    );

    await this.owner.lookup('service:organization').load();

    this.setProperties({
      organization: this.owner.lookup('service:organization').selected,
      organizationTeam,
      organizationUsers,
      organizationProjects,
      organizationInvitations,
      projects,
    });

    this.owner.register('service:me', OrganizationMeStub);
    this.owner.register('service:notifications', NotificationsStub);
  });

  test.each(
    'it renders organization-team detail',
    ['owner', 'admin', 'member'],
    async function (assert, userRole) {
      const me = this.owner.lookup('service:me');

      if (userRole === 'admin') {
        me.org.is_owner = false;
      } else if (userRole == 'member') {
        me.org.is_owner = false;
        me.org.is_admin = false;
      }

      this.server.get('/organizations/:id/users/:userId', (schema, req) => {
        return schema.organizationUsers.find(req.params.userId)?.toJSON();
      });

      this.server.get('/v2/projects/:id', (schema, req) => {
        return schema.projects.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/organizations/:id/teams', (schema) => {
        return schema.organizationTeams.all().models;
      });

      await render(hbs`
        <OrganizationTeam::Details @showTeamDetail={{true}} @team={{this.organizationTeam}} @organization={{this.organization}} />
    `);

      assert.dom('[data-test-orgTeamDetail-title]').hasText('t:teamDetails:()');

      // team info
      assert
        .dom('[data-test-orgTeamDetailsInfo-name]')
        .hasText(this.organizationTeam.name);

      if (userRole === 'member') {
        assert.dom('[data-test-orgTeamDetailsInfo-editBtn]').doesNotExist();
      } else {
        assert
          .dom('[data-test-orgTeamDetailsInfo-editBtn]')
          .isNotDisabled()
          .hasText('t:editTeamName:()');
      }

      assert
        .dom('[data-test-orgTeamDetailsInfo-totalProjectlabel]')
        .hasText('t:totalProjects:()');

      assert
        .dom('[data-test-orgTeamDetailsInfo-totalProjectCount]')
        .hasText(`${this.organizationTeam.projectsCount}`);

      assert
        .dom('[data-test-orgTeamDetailsInfo-totalUserlabel]')
        .hasText('t:totalUsers:()');

      assert
        .dom('[data-test-orgTeamDetailsInfo-totalUserCount]')
        .hasText(`${this.organizationTeam.membersCount}`);

      if (userRole === 'member') {
        assert.dom('[data-test-orgTeamDetailsInfo-deleteBtn]').doesNotExist();
      } else {
        assert
          .dom('[data-test-orgTeamDetailsInfo-deleteBtn]')
          .isNotDisabled()
          .hasText('t:deleteTeam:()');
      }

      // projects
      assert.dom('[data-test-teamProjectList-title]').hasText('t:projects:()');

      assert
        .dom('[data-test-teamProjectList-description]')
        .hasText('t:teamProjectsDesc:()');

      if (userRole === 'member') {
        assert.dom('[data-test-teamProjectList-addProjectBtn]').doesNotExist();
      } else {
        assert
          .dom('[data-test-teamProjectList-addProjectBtn]')
          .isNotDisabled()
          .hasText('t:addProject:()');
      }

      const projectHeaderRows = findAll('[data-test-teamProjectList-thead] th');

      assert.dom(projectHeaderRows[0]).hasText('T:project:()');

      if (userRole === 'member') {
        assert.notOk(projectHeaderRows[1]);
        assert.notOk(projectHeaderRows[2]);
      } else {
        assert.dom(projectHeaderRows[1]).hasText('t:accessPermissions:()');
        assert.dom(projectHeaderRows[2]).hasText('t:action:()');
      }

      const projectContentRows = findAll('[data-test-teamProjectList-row]');

      assert.strictEqual(
        projectContentRows.length,
        this.organizationProjects.length
      );

      const projectContentRow = projectContentRows[0].querySelectorAll(
        '[data-test-teamProjectList-cell]'
      );

      assert.dom(projectContentRow[0]).hasText(this.projects[0].package_name);

      if (userRole === 'member') {
        assert.notOk(projectContentRow[1]);
        assert.notOk(projectContentRow[2]);
      } else {
        assert
          .dom('[data-test-ak-form-label]', projectContentRow[1])
          .hasText('t:allowEdit:()');

        assert
          .dom('[data-test-accessPermission-checkbox]', projectContentRow[1])
          [this.organizationProjects[0].write ? 'isChecked' : 'isNotChecked']();

        assert
          .dom('[data-test-teamProjectList-actionBtn]', projectContentRow[2])
          .isNotDisabled();
      }

      // team member
      if (userRole === 'member') {
        assert.dom('[data-test-teamUserList-title]').doesNotExist();
        assert.dom('[data-test-teamUserList-description]').doesNotExist();
        assert.dom('[data-test-teamUserList-addUserBtn]').doesNotExist();
        assert.dom('[data-test-teamUserList-thead]').doesNotExist();
        assert.dom('[data-test-teamUserList-row]').doesNotExist();
        assert.dom('[data-test-teamUserList-cell]').doesNotExist();
      } else {
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

        assert.strictEqual(
          userContentRows.length,
          this.organizationUsers.length
        );

        const userContentRow = userContentRows[0].querySelectorAll(
          '[data-test-teamUserList-cell]'
        );

        assert
          .dom(userContentRow[0])
          .hasText(this.organizationUsers[0].username);
        assert.dom(userContentRow[1]).hasText(this.organizationUsers[0].email);

        assert
          .dom('[data-test-teamUserList-actionBtn]', userContentRow[2])
          .isNotDisabled();
      }

      // team invitation
      if (userRole === 'member') {
        assert.dom('[data-test-teamInviteList-title]').doesNotExist();
        assert.dom('[data-test-teamInviteList-description]').doesNotExist();
        assert.dom('[data-test-teamInviteList-inviteBtn]').doesNotExist();
        assert.dom('[data-test-invitation-list-thead]').doesNotExist();
        assert.dom('[data-test-invitation-list-row]').doesNotExist();
        assert.dom('[data-test-invitation-list-cell]').doesNotExist();
      } else {
        assert
          .dom('[data-test-teamInviteList-title]')
          .hasText('t:teamInvitations:()');

        assert
          .dom('[data-test-teamInviteList-description]')
          .hasText('t:teamInvitationsDesc:()');

        assert
          .dom('[data-test-teamInviteList-inviteBtn]')
          .isNotDisabled()
          .hasText('t:inviteUsers:()');

        const inviteHeaderRow = findAll('[data-test-invitation-list-thead] th');

        assert.dom(inviteHeaderRow[0]).hasText('t:email:()');
        assert.dom(inviteHeaderRow[1]).hasText('t:invitedOn:()');
        assert.dom(inviteHeaderRow[2]).hasText('t:resend:()');
        assert.dom(inviteHeaderRow[3]).hasText('t:delete:()');

        const inviteContentRows = findAll('[data-test-invitation-list-row]');

        assert.strictEqual(
          inviteContentRows.length,
          this.organizationInvitations.length
        );

        const inviteContentRow = inviteContentRows[0].querySelectorAll(
          '[data-test-invitation-list-cell]'
        );

        assert
          .dom(inviteContentRow[0])
          .hasText(this.organizationInvitations[0].email);

        assert
          .dom(inviteContentRow[1])
          .hasText(dayjs(this.organizationInvitations[0].created_on).fromNow());

        assert
          .dom('[data-test-invitation-resend-btn]', inviteContentRow[2])
          .exists()
          .isNotDisabled();

        assert
          .dom('[data-test-invitation-delete-btn]', inviteContentRow[3])
          .exists()
          .isNotDisabled();
      }
    }
  );

  test.each(
    'test organization-team edit name',
    [{ fail: false }, { fail: true }],
    async function (assert, { fail }) {
      this.server.get('/organizations/:id/users/:userId', (schema, req) => {
        return schema.organizationUsers.find(req.params.userId)?.toJSON();
      });

      this.server.get('/v2/projects/:id', (schema, req) => {
        return schema.projects.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/organizations/:id/teams', (schema) => {
        return schema.organizationTeams.all().models;
      });

      this.server.post('/organizations/:id/teams', (schema, req) => {
        return fail ? new Response(500) : JSON.parse(req.requestBody);
      });

      await render(hbs`
        <OrganizationTeam::Details @showTeamDetail={{true}} @team={{this.organizationTeam}} @organization={{this.organization}} />
    `);

      assert.dom('[data-test-orgTeamDetail-title]').hasText('t:teamDetails:()');

      assert
        .dom('[data-test-orgTeamDetailsInfo-editBtn]')
        .isNotDisabled()
        .hasText('t:editTeamName:()');

      await click('[data-test-orgTeamDetailsInfo-editBtn]');

      assert
        .dom('[data-test-teamDetailAction-titleBtn]')
        .isNotDisabled()
        .hasText(this.organizationTeam.name);

      assert
        .dom('[data-test-form-label]')
        .hasText('t:editTeamNameInputLabel:()');

      assert
        .dom('[data-test-editTeamName-input]')
        .isNotDisabled()
        .hasValue(this.organizationTeam.name);

      assert
        .dom('[data-test-teamDetailAction-backBtn]')
        .isNotDisabled()
        .hasText('t:back:()');

      assert
        .dom('[data-test-teamDetailAction-actionBtn]')
        .isDisabled()
        .hasText('t:edit:()');

      await fillIn('[data-test-editTeamName-input]', 'testEdit');

      assert.dom('[data-test-teamDetailAction-actionBtn]').isNotDisabled();

      await click('[data-test-teamDetailAction-actionBtn]');

      const notify = this.owner.lookup('service:notifications');

      if (fail) {
        assert.strictEqual(notify.errorMsg, 't:pleaseTryAgain:()');

        assert.dom('[data-test-teamDetailAction-titleBtn]').exists();
        assert.dom('[data-test-editTeamName-input]').exists();
        assert.dom('[data-test-teamDetailAction-backBtn]').exists();
        assert.dom('[data-test-teamDetailAction-actionBtn]').exists();
      } else {
        assert.strictEqual(
          notify.successMsg,
          't:organizationTeamNameUpdated:()'
        );

        assert.dom('[data-test-teamDetailAction-titleBtn]').doesNotExist();
        assert.dom('[data-test-editTeamName-input]').doesNotExist();
        assert.dom('[data-test-teamDetailAction-backBtn]').doesNotExist();
        assert.dom('[data-test-teamDetailAction-actionBtn]').doesNotExist();
      }
    }
  );

  test('it renders organization-team add project action', async function (assert) {
    this.server.get('/organizations/:id/users/:userId', (schema, req) => {
      return schema.organizationUsers.find(req.params.userId)?.toJSON();
    });

    this.server.get('/v2/projects/:id', (schema, req) => {
      return schema.projects.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/organizations/:id/teams', (schema) => {
      return schema.organizationTeams.all().models;
    });

    await render(hbs`
        <OrganizationTeam::Details @showTeamDetail={{true}} @team={{this.organizationTeam}} @organization={{this.organization}} />
    `);

    assert.dom('[data-test-orgTeamDetail-title]').hasText('t:teamDetails:()');

    assert
      .dom('[data-test-teamProjectList-addProjectBtn]')
      .isNotDisabled()
      .hasText('t:addProject:()');

    await click('[data-test-teamProjectList-addProjectBtn]');

    assert
      .dom('[data-test-teamDetailAction-titleBtn]')
      .isNotDisabled()
      .hasText(this.organizationTeam.name);

    assert.dom('[data-test-addProjectList-title]').hasText('t:addProject:()');

    assert
      .dom('[data-test-addProjectList-description]')
      .hasText('t:addTeamProjectDesc:()');

    assert
      .dom('[data-test-addProjectList-searchInput]')
      .isNotDisabled()
      .hasNoValue();

    const headerRow = findAll('[data-test-addProjectList-thead] th');

    assert.dom(headerRow[0]).hasText('t:name:()');
    assert.dom(headerRow[1]).hasText('t:action:()');

    const contentRows = findAll('[data-test-addProjectList-row]');

    const contentRow = contentRows[0].querySelectorAll(
      '[data-test-addProjectList-cell]'
    );

    assert.dom(contentRow[0]).hasText(this.projects[0].package_name);

    assert
      .dom('[data-test-checkbox]', contentRow[1])
      .isNotChecked()
      .isNotDisabled();

    assert
      .dom('[data-test-teamDetailAction-backBtn]')
      .isNotDisabled()
      .hasText('t:back:()');

    assert
      .dom('[data-test-teamDetailAction-actionBtn]')
      .isDisabled()
      .hasText('t:addProject:()');
  });

  test('it renders organization-team add user action', async function (assert) {
    this.server.get('/organizations/:id/users/:userId', (schema, req) => {
      return schema.organizationUsers.find(req.params.userId)?.toJSON();
    });

    this.server.get('/v2/projects/:id', (schema, req) => {
      return schema.projects.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/organizations/:id/teams', (schema) => {
      return schema.organizationTeams.all().models;
    });

    await render(hbs`
        <OrganizationTeam::Details @showTeamDetail={{true}} @team={{this.organizationTeam}} @organization={{this.organization}} />
    `);

    assert.dom('[data-test-orgTeamDetail-title]').hasText('t:teamDetails:()');

    assert
      .dom('[data-test-teamUserList-addUserBtn]')
      .isNotDisabled()
      .hasText('t:addUser:()');

    await click('[data-test-teamUserList-addUserBtn]');

    assert
      .dom('[data-test-teamDetailAction-titleBtn]')
      .isNotDisabled()
      .hasText(this.organizationTeam.name);

    assert.dom('[data-test-addUserList-title]').hasText('t:addUsers:()');

    assert
      .dom('[data-test-addUserList-description]')
      .hasText('t:addTeamMemberDesc:()');

    assert
      .dom('[data-test-addUserList-searchInput]')
      .isNotDisabled()
      .hasNoValue();

    const headerRow = findAll('[data-test-addUserList-thead] th');

    assert.dom(headerRow[0]).hasText('t:name:()');
    assert.dom(headerRow[1]).hasText('t:action:()');

    const contentRows = findAll('[data-test-addUserList-row]');

    const contentRow = contentRows[0].querySelectorAll(
      '[data-test-addUserList-cell]'
    );

    assert.dom(contentRow[0]).hasText(this.organizationUsers[0].username);

    assert
      .dom('[data-test-checkbox]', contentRow[1])
      .isNotChecked()
      .isNotDisabled();

    assert
      .dom('[data-test-teamDetailAction-backBtn]')
      .isNotDisabled()
      .hasText('t:back:()');

    assert
      .dom('[data-test-teamDetailAction-actionBtn]')
      .isDisabled()
      .hasText('t:addUsers:()');
  });

  test('it renders organization-team invite user action', async function (assert) {
    this.server.get('/organizations/:id/users/:userId', (schema, req) => {
      return schema.organizationUsers.find(req.params.userId)?.toJSON();
    });

    this.server.get('/v2/projects/:id', (schema, req) => {
      return schema.projects.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/organizations/:id/teams', (schema) => {
      return schema.organizationTeams.all().models;
    });

    await render(hbs`
        <OrganizationTeam::Details @showTeamDetail={{true}} @team={{this.organizationTeam}} @organization={{this.organization}} />
    `);

    assert.dom('[data-test-orgTeamDetail-title]').hasText('t:teamDetails:()');

    assert
      .dom('[data-test-teamInviteList-inviteBtn]')
      .isNotDisabled()
      .hasText('t:inviteUsers:()');

    await click('[data-test-teamInviteList-inviteBtn]');

    assert
      .dom('[data-test-teamDetailAction-titleBtn]')
      .isNotDisabled()
      .hasText(this.organizationTeam.name);

    assert.dom('[data-test-label-primary-text]').hasText('t:email:()');

    assert
      .dom('[data-test-label-secondary-text]')
      .hasText('t:inviteUserMultipleEmailHelperText:()');

    assert.dom('[data-test-invite-member-input]').isNotDisabled().hasNoValue();

    assert.dom('[data-test-email-chip]').doesNotExist();

    assert
      .dom('[data-test-teamDetailAction-backBtn]')
      .isNotDisabled()
      .hasText('t:back:()');

    assert
      .dom('[data-test-teamDetailAction-actionBtn]')
      .isNotDisabled()
      .hasText('t:invite:()');
  });

  // TODO: remove skip once ui is uncommmented
  test.skip('test organization-team invitation-list search', async function (assert) {
    this.server.get('/organizations/:id/users/:userId', (schema, req) => {
      return schema.organizationUsers.find(req.params.userId)?.toJSON();
    });

    this.server.get('/v2/projects/:id', (schema, req) => {
      return schema.projects.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/organizations/:id/teams', (schema) => {
      return schema.organizationTeams.all().models;
    });

    this.server.get(
      '/organizations/:id/teams/:teamId/invitations',
      (schema, req) => {
        this.set('query', req.queryParams.q);

        return schema.organizationInvitations.all().models;
      }
    );

    await render(hbs`
        <OrganizationTeam::Details @showTeamDetail={{true}} @team={{this.organizationTeam}} @organization={{this.organization}} />
    `);

    assert.dom('[data-test-orgTeamDetail-title]').hasText('t:teamDetails:()');

    assert
      .dom('[data-test-teamInviteList-title]')
      .hasText('t:teamInvitations:()');

    assert.dom('[data-test-teamInviteList-searchInput]').hasNoValue();
    assert.notOk(this.query);

    await fillIn('[data-test-teamInviteList-searchInput]', 'test');
    await triggerEvent('[data-test-teamInviteList-searchInput]', 'keyup');

    assert.dom('[data-test-teamInviteList-searchInput]').hasValue(this.query);
    assert.strictEqual(this.query, 'test');
  });

  test.each(
    'test organization-team invite user',
    [{ fail: false }, { fail: true }],
    async function (assert, { fail }) {
      this.server.get('/organizations/:id/users/:userId', (schema, req) => {
        return schema.organizationUsers.find(req.params.userId)?.toJSON();
      });

      this.server.get('/v2/projects/:id', (schema, req) => {
        return schema.projects.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/organizations/:id/teams', (schema) => {
        return schema.organizationTeams.all().models;
      });

      this.server.post('/organizations/:id/teams/:teamId/invitations', () => {
        return fail ? new Response(500) : {};
      });

      await render(hbs`
        <OrganizationTeam::Details @showTeamDetail={{true}} @team={{this.organizationTeam}} @organization={{this.organization}} />
    `);

      assert.dom('[data-test-orgTeamDetail-title]').hasText('t:teamDetails:()');

      assert
        .dom('[data-test-teamInviteList-inviteBtn]')
        .isNotDisabled()
        .hasText('t:inviteUsers:()');

      await click('[data-test-teamInviteList-inviteBtn]');

      assert
        .dom('[data-test-invite-member-input]')
        .isNotDisabled()
        .hasNoValue();

      assert
        .dom('[data-test-text-input-outlined]')
        .doesNotHaveClass(/ak-error-text-input/);

      assert.dom('[data-test-helper-text]').doesNotExist();

      assert.dom('[data-test-email-chip]').doesNotExist();

      assert
        .dom('[data-test-teamDetailAction-backBtn]')
        .isNotDisabled()
        .hasText('t:back:()');

      assert
        .dom('[data-test-teamDetailAction-actionBtn]')
        .isNotDisabled()
        .hasText('t:invite:()');

      // test error state
      await click('[data-test-teamDetailAction-actionBtn]');

      assert
        .dom('[data-test-text-input-outlined]')
        .hasClass(/ak-error-text-input/);

      assert.dom('[data-test-helper-text]').hasText('t:emptyEmailId:()');

      // valid value
      await fillIn('[data-test-invite-member-input]', 'test@mail.com');

      assert.dom('[data-test-invite-member-input]').hasValue('test@mail.com');

      assert.dom('[data-test-email-chip]').hasText('test@mail.com');

      await click('[data-test-teamDetailAction-actionBtn]');

      const notify = this.owner.lookup('service:notifications');

      if (fail) {
        assert.strictEqual(notify.errorMsg, 't:pleaseTryAgain:()');
        assert.dom('[data-test-invite-member-input]').hasValue('test@mail.com');
        assert.dom('[data-test-teamDetailAction-backBtn]').isNotDisabled();
        assert.dom('[data-test-teamDetailAction-actionBtn]').isNotDisabled();
      } else {
        assert.strictEqual(notify.successMsg, 't:orgMemberInvited:()');
        assert.dom('[data-test-invite-member-input]').doesNotExist();
        assert.dom('[data-test-teamDetailAction-backBtn]').doesNotExist();
        assert.dom('[data-test-teamDetailAction-actionBtn]').doesNotExist();
      }
    }
  );

  test.each(
    'test organization-team delete team action',
    [
      { fail: false },
      // TODO: mirage request not intercepting need to figure out
      // { fail: true }
    ],
    async function (assert, { fail }) {
      this.server.get('/organizations/:id/users/:userId', (schema, req) => {
        return schema.organizationUsers.find(req.params.userId)?.toJSON();
      });

      this.server.get('/v2/projects/:id', (schema, req) => {
        return schema.projects.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/organizations/:id/teams', (schema) => {
        return schema.organizationTeams.all().models;
      });

      this.server.delete('/organizations/:id/teams/:teamId', () => {
        return new Response(fail ? 500 : 204);
      });

      this.set('handleTeamDetailClose', () => {
        this.set('handleTeamDetailCloseCalled', true);
      });

      await render(hbs`
        <OrganizationTeam::Details @handleTeamDetailClose={{this.handleTeamDetailClose}} @showTeamDetail={{true}} @team={{this.organizationTeam}} @organization={{this.organization}} />
    `);

      assert.dom('[data-test-orgTeamDetail-title]').hasText('t:teamDetails:()');

      assert
        .dom('[data-test-orgTeamDetailsInfo-deleteBtn]')
        .isNotDisabled()
        .hasText('t:deleteTeam:()');

      await click('[data-test-orgTeamDetailsInfo-deleteBtn]');

      assert.dom('[data-test-ak-modal-header]').hasText('t:confirm:()');

      assert
        .dom('[data-test-confirmBox-cancelBtn]')
        .isNotDisabled()
        .hasText('t:cancel:()');

      assert
        .dom('[data-test-confirmBox-confirmBtn]')
        .isNotDisabled()
        .hasText('t:deleteTeam:()');

      assert
        .dom('[data-test-form-label]')
        .hasText('t:promptBox.deleteTeamPrompt.description:()');

      assert.dom('[data-test-orgTeamDetailsInfo-promptInput]').hasNoValue();

      // error checks
      const notify = this.owner.lookup('service:notifications');

      await click('[data-test-confirmBox-confirmBtn]');

      assert.strictEqual(notify.errorMsg, 't:enterRightTeamName:()');

      await fillIn('[data-test-orgTeamDetailsInfo-promptInput]', 'wrongName');

      await click('[data-test-confirmBox-confirmBtn]');

      assert.strictEqual(notify.errorMsg, 't:enterRightTeamName:()');

      // correct input
      await fillIn(
        '[data-test-orgTeamDetailsInfo-promptInput]',
        this.organizationTeam.name
      );

      await click('[data-test-confirmBox-confirmBtn]');

      if (fail) {
        assert.strictEqual(notify.errorMsg, 't:pleaseTryAgain:()');

        assert.dom('[data-test-ak-modal-header]').exists();
        assert.dom('[data-test-confirmBox-cancelBtn]').exists();
        assert.dom('[data-test-confirmBox-confirmBtn]').exists();
        assert.dom('[data-test-form-label]').exists();
        assert.dom('[data-test-orgTeamDetailsInfo-promptInput]').exists();
        assert.false(this.handleTeamDetailCloseCalled);
      } else {
        assert.strictEqual(
          notify.successMsg,
          `${this.organizationTeam.name} t:teamDeleted:()`
        );

        assert.dom('[data-test-ak-modal-header]').doesNotExist();
        assert.dom('[data-test-confirmBox-cancelBtn]').doesNotExist();
        assert.dom('[data-test-confirmBox-confirmBtn]').doesNotExist();
        assert.dom('[data-test-form-label]').doesNotExist();
        assert.dom('[data-test-orgTeamDetailsInfo-promptInput]').doesNotExist();
        assert.true(this.handleTeamDetailCloseCalled);
      }
    }
  );
});
