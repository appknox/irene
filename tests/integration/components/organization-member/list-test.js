import {
  render,
  findAll,
  find,
  click,
  fillIn,
  triggerEvent,
} from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { selectChoose } from 'ember-power-select/test-support';
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

module('Integration | Component | organization-member/list', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    this.server.createList('organization', 1);

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

    users[4].update({
      is_active: false,
    });

    await this.owner.lookup('service:organization').load();

    this.setProperties({
      organization: this.owner.lookup('service:organization').selected,
      organizationMembers,
      users,
    });

    this.owner.register('service:me', OrganizationMeStub);
    this.owner.register('service:notifications', NotificationsStub);
  });

  test('it renders organization user list', async function (assert) {
    this.server.get('/organizations/:id/members', (schema) => {
      return schema.organizationMembers.all().models;
    });

    this.server.get('/organizations/:id/users/:userId', (schema, req) => {
      const user = schema.organizationUsers.find(req.params.userId);

      return user?.toJSON();
    });

    await render(hbs`
      <OrganizationMember::List @organization={{this.organization}} />
    `);

    const inactiveUserFormControl = find('[data-test-inactive-user-label]');

    assert
      .dom('[data-test-user-search-input]')
      .exists()
      .isNotDisabled()
      .hasNoValue();

    assert
      .dom('[data-test-ak-form-label]', inactiveUserFormControl)
      .exists()
      .hasText('t:includeInactiveMembers:()');

    assert
      .dom('[data-test-inactive-user-checkbox]', inactiveUserFormControl)
      .exists()
      .isNotDisabled()
      .isNotChecked();

    assert.dom('[data-test-invite-member-btn]').exists();

    assert.dom('[data-test-org-user-table]').exists();

    const headerRow = find('[data-test-org-user-thead] tr').querySelectorAll(
      'th'
    );

    // assert header row
    assert.dom(headerRow[0]).hasText('t:user:()');
    assert.dom(headerRow[1]).hasText('t:email:()');
    assert.dom(headerRow[2]).hasText('t:role:()');
    assert.dom(headerRow[3]).hasText('t:action:()');

    const contentRows = findAll('[data-test-org-user-row]');

    assert.strictEqual(contentRows.length, this.organizationMembers.length);

    // first row sanity check
    const firstRow = contentRows[0].querySelectorAll(
      '[data-test-org-user-cell]'
    );

    assert.dom(firstRow[0]).hasText(this.users[0].username);
    assert.dom(firstRow[1]).hasText(this.users[0].email);

    assert
      .dom('.user-role-select-trigger', firstRow[2])
      .hasAria('disabled', 'false')
      .hasText('t:owner:()');

    assert
      .dom('[data-test-org-user-more-action-btn]', firstRow[3])
      .isNotDisabled();

    // second row sanity check
    const secondRow = contentRows[1].querySelectorAll(
      '[data-test-org-user-cell]'
    );

    assert
      .dom('.user-role-select-trigger', secondRow[2])
      .hasAria('disabled', 'false')
      .hasText('t:memberRole:()');

    // forth row sanity check
    const forthRow = contentRows[3].querySelectorAll(
      '[data-test-org-user-cell]'
    );

    assert
      .dom('.user-role-select-trigger', forthRow[2])
      .hasAria('disabled', 'false')
      .hasText('t:admin:()');
  });

  test('it renders organization user list for admin', async function (assert) {
    const me = this.owner.lookup('service:me');

    me.org.is_owner = false;

    this.server.get('/organizations/:id/members', (schema) => {
      return schema.organizationMembers.all().models;
    });

    this.server.get('/organizations/:id/users/:userId', (schema, req) => {
      const user = schema.organizationUsers.find(req.params.userId);

      return user?.toJSON();
    });

    await render(hbs`
      <OrganizationMember::List @organization={{this.organization}} />
    `);

    const inactiveUserFormControl = find('[data-test-inactive-user-label]');

    assert
      .dom('[data-test-user-search-input]')
      .exists()
      .isNotDisabled()
      .hasNoValue();

    assert
      .dom('[data-test-ak-form-label]', inactiveUserFormControl)
      .exists()
      .hasText('t:includeInactiveMembers:()');

    assert
      .dom('[data-test-inactive-user-checkbox]', inactiveUserFormControl)
      .exists()
      .isNotDisabled()
      .isNotChecked();

    assert.dom('[data-test-invite-member-btn]').doesNotExist();

    assert.dom('[data-test-org-user-table]').exists();

    const headerRow = find('[data-test-org-user-thead] tr').querySelectorAll(
      'th'
    );

    // assert header row
    assert.dom(headerRow[0]).hasText('t:user:()');
    assert.dom(headerRow[1]).hasText('t:email:()');
    assert.dom(headerRow[2]).hasText('t:role:()');

    assert.notOk(headerRow[3]);

    const contentRows = findAll('[data-test-org-user-row]');

    assert.strictEqual(contentRows.length, this.organizationMembers.length);

    // first row sanity check
    const firstRow = contentRows[0].querySelectorAll(
      '[data-test-org-user-cell]'
    );

    assert.dom(firstRow[0]).hasText(this.users[0].username);
    assert.dom(firstRow[1]).hasText(this.users[0].email);

    assert.dom('.user-role-select-trigger', firstRow[2]).doesNotExist();

    assert.dom(firstRow[2]).hasText('t:owner:()');

    assert.dom('[data-test-org-user-more-action-btn]').doesNotExist();

    // second row sanity check
    const secondRow = contentRows[1].querySelectorAll(
      '[data-test-org-user-cell]'
    );

    assert.dom('.user-role-select-trigger', secondRow[2]).doesNotExist();

    assert.dom(secondRow[2]).hasText('t:memberRole:()');

    // forth row sanity check
    const forthRow = contentRows[3].querySelectorAll(
      '[data-test-org-user-cell]'
    );

    assert.dom('.user-role-select-trigger', forthRow[2]).doesNotExist();

    assert.dom(forthRow[2]).hasText('t:admin:()');
  });

  test('test organization user role change success', async function (assert) {
    this.server.get('/organizations/:id/members', (schema) => {
      return schema.organizationMembers.all().models;
    });

    this.server.get('/organizations/:id/users/:userId', (schema, req) => {
      const user = schema.organizationUsers.find(req.params.userId);

      return user?.toJSON();
    });

    await render(hbs`
      <OrganizationMember::List @organization={{this.organization}} />
    `);

    const contentRows = findAll('[data-test-org-user-row]');

    assert.strictEqual(contentRows.length, this.organizationMembers.length);

    const contentRow = contentRows[0].querySelectorAll(
      '[data-test-org-user-cell]'
    );

    assert
      .dom('.user-role-select-trigger', contentRow[2])
      .hasAria('disabled', 'false')
      .hasText('t:owner:()');

    await selectChoose(
      `#${contentRow[2].id} .user-role-select-trigger`,
      't:admin:()'
    );

    const notify = this.owner.lookup('service:notifications');

    assert.strictEqual(notify.successMsg, 't:userRoleUpdated:()');
  });

  test('test organization user role change failure', async function (assert) {
    this.server.get('/organizations/:id/members', (schema) => {
      return schema.organizationMembers.all().models;
    });

    this.server.get('/organizations/:id/users/:userId', (schema, req) => {
      const user = schema.organizationUsers.find(req.params.userId);

      return user?.toJSON();
    });

    this.server.put('/organizations/:id/members/:memId', () => {
      return new Response(500);
    });

    await render(hbs`
      <OrganizationMember::List @organization={{this.organization}} />
    `);

    const contentRows = findAll('[data-test-org-user-row]');

    assert.strictEqual(contentRows.length, this.organizationMembers.length);

    const contentRow = contentRows[0].querySelectorAll(
      '[data-test-org-user-cell]'
    );

    assert
      .dom('.user-role-select-trigger', contentRow[2])
      .hasAria('disabled', 'false')
      .hasText('t:owner:()');

    await selectChoose(
      `#${contentRow[2].id} .user-role-select-trigger`,
      't:admin:()'
    );

    const notify = this.owner.lookup('service:notifications');

    assert.strictEqual(notify.errorMsg, 't:pleaseTryAgain:()');
  });

  test('test organization user deactivate', async function (assert) {
    this.server.get('/organizations/:id/members', (schema) => {
      return schema.organizationMembers.all().models;
    });

    this.server.get('/organizations/:id/users/:userId', (schema, req) => {
      const user = schema.organizationUsers.find(req.params.userId);

      return user?.toJSON();
    });

    await render(hbs`
      <OrganizationMember::List @organization={{this.organization}} />
    `);

    const contentRows = findAll('[data-test-org-user-row]');

    assert.strictEqual(contentRows.length, this.organizationMembers.length);

    const contentRow = contentRows[0].querySelectorAll(
      '[data-test-org-user-cell]'
    );

    assert
      .dom('[data-test-org-user-username]', contentRow[0])
      .hasText(this.users[0].username);

    assert.dom('[data-test-inactive-chip]', contentRow[0]).doesNotExist();

    await click(`#${contentRow[3].id} [data-test-org-user-more-action-btn]`);

    assert
      .dom('[data-test-user-active-toggle-opt]')
      .exists()
      .hasText('t:deactivateUser:()');

    await click('[data-test-user-active-toggle-opt] button');

    assert
      .dom('[data-test-ak-modal-header]')
      .hasText('t:userDeactivateTitle:()');

    assert
      .dom('[data-test-confirmbox-description]')
      .hasText(
        `t:userActivationChangeMessage:() ${this.users[0].username} t:inactive:() ?`
      );

    assert
      .dom('[data-test-confirmbox-confirmBtn]')
      .exists()
      .isNotDisabled()
      .hasText('t:confirm:()');

    assert
      .dom('[data-test-confirmbox-cancelBtn]')
      .exists()
      .isNotDisabled()
      .hasText('t:cancel:()');

    await click('[data-test-confirmbox-confirmBtn]');

    const notify = this.owner.lookup('service:notifications');

    assert.strictEqual(
      notify.successMsg,
      `t:deactivated:() ${this.users[0].username}`
    );

    assert.dom('[data-test-ak-modal-header]').doesNotExist();
    assert.dom('[data-test-confirmbox-confirmBtn]').doesNotExist();
    assert.dom('[data-test-confirmbox-cancelBtn]').doesNotExist();
  });

  test('test organization user activate', async function (assert) {
    this.server.get('/organizations/:id/members', (schema) => {
      return schema.organizationMembers.all().models;
    });

    this.server.get('/organizations/:id/users/:userId', (schema, req) => {
      const user = schema.organizationUsers.find(req.params.userId);

      return user?.toJSON();
    });

    await render(hbs`
      <OrganizationMember::List @organization={{this.organization}} />
    `);

    const contentRows = findAll('[data-test-org-user-row]');

    assert.strictEqual(contentRows.length, this.organizationMembers.length);

    const contentRow = contentRows[4].querySelectorAll(
      '[data-test-org-user-cell]'
    );

    assert
      .dom('[data-test-org-user-username]', contentRow[0])
      .hasText(this.users[4].username);

    assert
      .dom('[data-test-inactive-chip]', contentRow[0])
      .exists()
      .hasText('t:chipStatus.inactive:()');

    await click(`#${contentRow[3].id} [data-test-org-user-more-action-btn]`);

    assert
      .dom('[data-test-user-active-toggle-opt]')
      .exists()
      .hasText('t:activateUser:()');

    await click('[data-test-user-active-toggle-opt] button');

    assert.dom('[data-test-ak-modal-header]').hasText('t:userActivateTitle:()');

    assert
      .dom('[data-test-confirmbox-description]')
      .hasText(
        `t:userActivationChangeMessage:() ${this.users[4].username} t:active:() ?`
      );

    assert
      .dom('[data-test-confirmbox-confirmBtn]')
      .exists()
      .isNotDisabled()
      .hasText('t:confirm:()');

    assert
      .dom('[data-test-confirmbox-cancelBtn]')
      .exists()
      .isNotDisabled()
      .hasText('t:cancel:()');

    await click('[data-test-confirmbox-confirmBtn]');

    const notify = this.owner.lookup('service:notifications');

    assert.strictEqual(
      notify.successMsg,
      `t:activated:() ${this.users[4].username}`
    );

    assert.dom('[data-test-ak-modal-header]').doesNotExist();
    assert.dom('[data-test-confirmbox-confirmBtn]').doesNotExist();
    assert.dom('[data-test-confirmbox-cancelBtn]').doesNotExist();
  });

  test('test organization user activate/deactivate failure', async function (assert) {
    this.server.get('/organizations/:id/members', (schema) => {
      return schema.organizationMembers.all().models;
    });

    this.server.get('/organizations/:id/users/:userId', (schema, req) => {
      const user = schema.organizationUsers.find(req.params.userId);

      return user?.toJSON();
    });

    this.server.put('/organizations/:id/users/:userId', () => {
      return new Response(500);
    });

    await render(hbs`
      <OrganizationMember::List @organization={{this.organization}} />
    `);

    const contentRows = findAll('[data-test-org-user-row]');

    assert.strictEqual(contentRows.length, this.organizationMembers.length);

    const contentRow = contentRows[4].querySelectorAll(
      '[data-test-org-user-cell]'
    );

    assert
      .dom('[data-test-org-user-username]', contentRow[0])
      .hasText(this.users[4].username);

    assert
      .dom('[data-test-inactive-chip]', contentRow[0])
      .exists()
      .hasText('t:chipStatus.inactive:()');

    await click(`#${contentRow[3].id} [data-test-org-user-more-action-btn]`);

    assert
      .dom('[data-test-user-active-toggle-opt]')
      .exists()
      .hasText('t:activateUser:()');

    await click('[data-test-user-active-toggle-opt] button');

    assert.dom('[data-test-ak-modal-header]').hasText('t:userActivateTitle:()');

    assert
      .dom('[data-test-confirmbox-description]')
      .hasText(
        `t:userActivationChangeMessage:() ${this.users[4].username} t:active:() ?`
      );

    assert
      .dom('[data-test-confirmbox-confirmBtn]')
      .exists()
      .isNotDisabled()
      .hasText('t:confirm:()');

    assert
      .dom('[data-test-confirmbox-cancelBtn]')
      .exists()
      .isNotDisabled()
      .hasText('t:cancel:()');

    await click('[data-test-confirmbox-confirmBtn]');

    const notify = this.owner.lookup('service:notifications');

    assert.strictEqual(notify.errorMsg, 't:pleaseTryAgain:()');

    assert.dom('[data-test-ak-modal-header]').exists();
    assert.dom('[data-test-confirmbox-confirmBtn]').exists();
    assert.dom('[data-test-confirmbox-cancelBtn]').exists();
  });

  test('test organization user inactive user checkbox', async function (assert) {
    this.server.get('/organizations/:id/members', (schema, req) => {
      this.set('is_active', req.queryParams.is_active);

      return schema.organizationMembers.all().models;
    });

    this.server.get('/organizations/:id/users/:userId', (schema, req) => {
      const user = schema.organizationUsers.find(req.params.userId);

      return user?.toJSON();
    });

    await render(hbs`
      <OrganizationMember::List @organization={{this.organization}} />
    `);

    const contentRows = findAll('[data-test-org-user-row]');

    assert.strictEqual(contentRows.length, this.organizationMembers.length);

    assert.strictEqual(this.is_active, 'true');

    await click('[data-test-inactive-user-label]');

    assert.dom('[data-test-inactive-user-checkbox]').isChecked();

    assert.strictEqual(typeof this.is_active, 'undefined');
  });

  test('test organization user search', async function (assert) {
    this.server.get('/organizations/:id/members', (schema, req) => {
      this.set('query', req.queryParams.q);

      return schema.organizationMembers.all().models;
    });

    this.server.get('/organizations/:id/users/:userId', (schema, req) => {
      const user = schema.organizationUsers.find(req.params.userId);

      return user?.toJSON();
    });

    await render(hbs`
      <OrganizationMember::List @organization={{this.organization}} />
    `);

    const contentRows = findAll('[data-test-org-user-row]');

    assert.strictEqual(contentRows.length, this.organizationMembers.length);

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
  });
});
