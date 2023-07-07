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
import dayjs from 'dayjs';

class RouterStub extends Service {
  currentRouteName = '';
  queryParams = null;

  transitionTo({ queryParams }) {
    this.queryParams = queryParams;
  }
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

    const store = this.owner.lookup('service:store');
    const organizationMe = store.createRecord('organization-me', {
      is_owner: true,
      is_admin: true,
    });

    class OrganizationMeStub extends Service {
      org = organizationMe;
    }

    const organizationMembers = this.server.createList(
      'organization-member',
      5
    );

    const organizationTeams = this.server.createList('organization-team', 3);

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

    const queryParams = {
      user_limit: 10,
      user_offset: 0,
      user_query: '',
      show_inactive_user: false,
    };

    this.setProperties({
      organization: this.owner.lookup('service:organization').selected,
      organizationMembers,
      organizationTeams,
      users,
      queryParams,
    });

    this.owner.register('service:me', OrganizationMeStub);
    this.owner.register('service:notifications', NotificationsStub);
    this.owner.register('service:router', RouterStub);
  });

  test('it renders organization user list', async function (assert) {
    this.server.get('/organizations/:id/members', (schema) => {
      const results = schema.organizationMembers.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    this.server.get('/organizations/:id/users/:userId', (schema, req) => {
      const user = schema.organizationUsers.find(req.params.userId);

      return user?.toJSON();
    });

    await render(hbs`
      <OrganizationMember::List @queryParams={{this.queryParams}} @organization={{this.organization}} />
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
    assert.dom(headerRow[3]).hasText('t:lastLoggedIn:()');

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

    if (this.organizationMembers[0].last_logged_in) {
      assert
        .dom(firstRow[3])
        .hasText(
          dayjs(this.organizationMembers[0].last_logged_in).format(
            'MMM DD, YYYY'
          )
        );
    } else {
      assert.dom(firstRow[3]).hasText('t:never:()');
    }

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
      const results = schema.organizationMembers.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    this.server.get('/organizations/:id/users/:userId', (schema, req) => {
      const user = schema.organizationUsers.find(req.params.userId);

      return user?.toJSON();
    });

    await render(hbs`
      <OrganizationMember::List @queryParams={{this.queryParams}} @organization={{this.organization}} />
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
    assert.dom(headerRow[3]).hasText('t:lastLoggedIn:()');

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

    if (this.organizationMembers[0].last_logged_in) {
      assert
        .dom(firstRow[3])
        .hasText(
          dayjs(this.organizationMembers[0].last_logged_in).format(
            'MMM DD, YYYY'
          )
        );
    } else {
      assert.dom(firstRow[3]).hasText('t:never:()');
    }

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

  test('it opens a drawer with member details on row click', async function (assert) {
    this.server.get('/organizations/:id/members', (schema) => {
      const results = schema.organizationMembers.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    this.server.get('/organizations/:id/users/:userId', (schema, req) => {
      const user = schema.organizationUsers.find(req.params.userId);

      return user?.toJSON();
    });

    this.server.get('/organizations/:id/teams', (schema) => {
      const results = schema.organizationTeams.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    await render(hbs`
      <OrganizationMember::List @queryParams={{this.queryParams}} @organization={{this.organization}} />
    `);

    const contentRows = findAll('[data-test-org-user-row]');

    assert.strictEqual(contentRows.length, this.organizationMembers.length);

    // first row sanity check
    const contentRow = contentRows[0].querySelectorAll(
      '[data-test-org-user-cell]'
    );

    await click(contentRow[0]);

    assert.dom('[data-test-member-drawer]').exists();
    assert.dom('[data-test-member-drawer-title]').hasText('t:userDetails:()');
    assert.dom('[data-test-add-to-team-button]').hasText('t:addToTeams:()');
    assert.dom('[data-test-member-drawer-close-btn]').exists();

    await click('[data-test-member-drawer-close-btn]');

    assert.dom('[data-test-member-drawer]').doesNotExist();
  });

  test('test organization user role change success', async function (assert) {
    this.server.get('/organizations/:id/members', (schema) => {
      const results = schema.organizationMembers.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    this.server.get('/organizations/:id/users/:userId', (schema, req) => {
      const user = schema.organizationUsers.find(req.params.userId);

      return user?.toJSON();
    });

    await render(hbs`
      <OrganizationMember::List @queryParams={{this.queryParams}} @organization={{this.organization}} />
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
      const results = schema.organizationMembers.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    this.server.get('/organizations/:id/users/:userId', (schema, req) => {
      const user = schema.organizationUsers.find(req.params.userId);

      return user?.toJSON();
    });

    this.server.put('/organizations/:id/members/:memId', () => {
      return new Response(500);
    });

    await render(hbs`
      <OrganizationMember::List @queryParams={{this.queryParams}} @organization={{this.organization}} />
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

  test('test organization user inactive user checkbox', async function (assert) {
    this.server.get('/organizations/:id/members', (schema, req) => {
      this.set('is_active', req.queryParams.is_active);

      const results = schema.organizationMembers.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    this.server.get('/organizations/:id/users/:userId', (schema, req) => {
      const user = schema.organizationUsers.find(req.params.userId);

      return user?.toJSON();
    });

    await render(hbs`
      <OrganizationMember::List @queryParams={{this.queryParams}} @organization={{this.organization}} />
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

      const results = schema.organizationMembers.all().models;

      return { count: results.length, next: null, previous: null, results };
    });

    this.server.get('/organizations/:id/users/:userId', (schema, req) => {
      const user = schema.organizationUsers.find(req.params.userId);

      return user?.toJSON();
    });

    await render(hbs`
      <OrganizationMember::List @queryParams={{this.queryParams}} @organization={{this.organization}} />
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
