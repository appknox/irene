import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';

module(
  'Integration | Component | organization-member/list/member-drawer',
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

      const organizationUser = this.server.create('organization-user');

      const normalizedOrganizationMember = store.normalize(
        'organization-member',
        member.toJSON()
      );

      await this.owner.lookup('service:organization').load();

      this.owner.register('service:me', OrganizationMeStub);

      this.setProperties({
        organization: this.owner.lookup('service:organization').selected,
        member: store.push(normalizedOrganizationMember),
        organizationUser,
        handleUserDetailClose: () => {},
      });
    });

    test('test member details drawer', async function (assert) {
      await render(
        hbs`<OrganizationMember::List::MemberDrawer 
              @organization={{this.organization}} 
              @member={{this.member}} 
              @handleUserDetailsClose={{this.handleUserDetailsClose}} 
              @showUserDetailsView={{true}}   
            />`
      );

      assert.dom('[data-test-member-drawer]').exists();
      assert.dom('[data-test-member-drawer-title]').hasText(t('userDetails'));
      assert.dom('[data-test-member-drawer-content]').exists();
    });

    test('test add to team drawer', async function (assert) {
      await render(
        hbs`<OrganizationMember::List::MemberDrawer 
              @organization={{this.organization}} 
              @member={{this.member}} 
              @handleUserDetailsClose={{this.handleUserDetailsClose}} 
              @showUserDetailsView={{true}}  
            />`
      );

      assert.dom('[data-test-member-drawer]').exists();
      assert.dom('[data-test-add-to-team-button]').exists();

      await click('[data-test-add-to-team-button]');

      assert.dom('[data-test-add-to-team-modal]').exists();
      assert.dom('[data-test-member-drawer-title]').hasText(t('addToTeams'));
      assert.dom('[data-test-member-drawer-content]').exists();
    });
  }
);
