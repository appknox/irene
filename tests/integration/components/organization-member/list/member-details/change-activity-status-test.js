import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import Service from '@ember/service';

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
  'Integration | Component | organization-member/list/member-details/change-activity-status',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      const store = this.owner.lookup('service:store');

      const member = this.server.create('organization-member');

      const organizationUser = this.server.create('organization-user');

      const normalizedOrganizationMember = store.normalize(
        'organization-member',
        member.toJSON()
      );

      this.setProperties({
        member: store.push(normalizedOrganizationMember),
        organizationUser,
        is_active: true,
      });

      this.owner.register('service:notifications', NotificationsStub);
    });

    test('it renders user activity status change button', async function (assert) {
      this.server.get('/organizations/:id/users/:userId', (schema, req) => {
        const user = schema.organizationUsers.find(req.params.userId);

        return user?.toJSON();
      });

      await render(hbs`
        <OrganizationMember::List::MemberDetails::ChangeActivityStatus 
          @member={{this.member}} 
        />
      `);

      assert.dom('[data-test-change-activity-status]').exists();

      if (this.organizationUser.is_active) {
        this.set('is_active', true);
        assert
          .dom('[data-test-change-activity-status]')
          .hasText(t('deactivateUser'));

        assert
          .dom('[data-test-change-activity-status-description]')
          .containsText(t('deactivateUserDesc'));
      } else {
        this.set('is_active', false);
        assert
          .dom('[data-test-change-activity-status]')
          .hasText(t('activateUser'));

        assert
          .dom('[data-test-change-activity-status-description]')
          .containsText(t('activateUserDesc'));
      }

      assert.dom('[data-test-change-activity-status]').isNotDisabled();
    });

    test('user activity status change test', async function (assert) {
      this.server.get('/organizations/:id/users/:userId', (schema, req) => {
        const user = schema.organizationUsers.find(req.params.userId);

        return user?.toJSON();
      });

      this.server.put('/organizations/:id/users/:userId', (schema, req) => {
        const data = JSON.parse(req.requestBody);

        schema.db.organizationUsers.update(`${req.params.userId}`, data);

        return schema.organizationUsers.find(req.params.userId).toJSON();
      });

      await render(hbs`
        <OrganizationMember::List::MemberDetails::ChangeActivityStatus 
          @member={{this.member}} 
        />
      `);

      assert.dom('[data-test-change-activity-status]').exists().isNotDisabled();

      await click('[data-test-change-activity-status]');

      assert.dom('[data-test-confirmbox-description]').exists();

      assert
        .dom('[data-test-confirmbox-confirmBtn]')
        .isNotDisabled()
        .hasText(t('confirm'));

      assert
        .dom('[data-test-confirmbox-cancelBtn]')
        .isNotDisabled()
        .hasText(t('cancel'));

      await click('[data-test-confirmbox-confirmBtn]');

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(
        notify.successMsg,
        this.is_active
          ? `${t('deactivated')} ${this.organizationUser.username}`
          : `${t('activated')} ${this.organizationUser.username}`
      );

      await click('[data-test-change-activity-status]');
      await click('[data-test-confirmbox-cancelBtn]');

      assert.dom('[data-test-confirmbox]').doesNotExist();
    });
  }
);
