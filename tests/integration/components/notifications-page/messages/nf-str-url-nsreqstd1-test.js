import { module, test } from 'qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { NotificationMap } from 'irene/components/notifications-page/notification_map';

module(
  'Integration | Component | notifications-page/messages/nf-str-url-nsreqstd1',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    const ContextClass = NotificationMap['NF_STR_URL_NSREQSTD1'].context;

    hooks.beforeEach(async function () {
      const organization = this.server.create('organization', {});
      const currentUser = this.server.create('current-user', {
        organization: organization,
      });

      this.server.create('organization-me', {
        id: currentUser.id,
      });
      const user = this.server.create('user', {
        id: currentUser.id,
      });

      this.server.create('organization-user', {
        id: currentUser.id,
        username: user.username,
        email: user.email,
        isActive: true,
      });
      const orgService = this.owner.lookup('service:organization');
      await orgService.load();
    });

    test('it should show approved state if namespace is approved and you if approver is current user', async function (assert) {
      const organization = this.server.schema.organizations.first();
      const currentUser = this.server.schema.currentUsers.first();
      const user = this.server.schema.users.find(currentUser.id);

      const org_user_requestedby = this.server.create('organization-user', {
        username: 'appknox_requester',
        email: 'appknox_requester@test.com',
        isActive: true,
      });

      const org_user_approvedby = this.server.create('organization-user', {
        username: user.username,
        email: user.email,
        isActive: true,
      });

      const namespace = this.server.create('organization-namespace', {
        value: 'com.mfva.test',
        createdOn: new Date(),
        approvedOn: new Date(),
        isApproved: true,
        organization: organization,
        requestedBy: org_user_requestedby,
        approvedBy: org_user_approvedby,
        platform: 1,
      });

      this.notification = this.server.create('nf-in-app-notification', {
        hasRead: true,
        messageCode: 'NF_STR_URL_NSREQSTD1',
        context: new ContextClass({
          namespace_id: namespace.id,
          namespace_created_on: new Date(),
          namespace_value: 'com.mfva.test',
          platform: 1,
          platform_display: 'android',
          requester_username: 'appknox_requester',
          store_url: 'https://play.google.com/mfva',
        }),
      });

      this.context = this.notification.context;

      await render(hbs`<NotificationsPage::Messages::NfStrUrlNsreqstd1 @notification={{this.notification}}
      @context={{this.context}}/>`);

      assert
        .dom('[data-test-namespaceMessage-title]')
        .hasText(t('approvalRequest'));

      assert.dom('[data-test-namespaceMessage-primary-message]').hasText(
        t('notificationModule.messages.nf-str-url-nsreqstd1', {
          requester_username: 'appknox_requester',
          platform_display: 'android',
          namespace_value: 'com.mfva.test',
        })
      );

      assert.dom('[data-test-namespaceMessage-approved-message]').hasText(
        t('notificationModule.namespaceMessage.approved', {
          moderaterName: 'You',
        })
      );

      assert.dom('[data-test-namespaceMessage-approved-icon]').exists();

      assert
        .dom('[data-test-namespaceMessage-viewAppOnStorelink]')
        .exists()
        .hasText(t('notificationModule.viewAppOnStore'));
    });

    test('it should show approved state if namespace is approved', async function (assert) {
      const organization = this.server.schema.organizations.first();

      const org_user_requestedby = this.server.create('organization-user', {
        username: 'appknox_requester',
        email: 'appknox_requester@test.com',
        isActive: true,
      });

      const org_user_approvedby = this.server.create('organization-user', {
        username: 'appknox_approver',
        email: 'appknox_approver@test.com',
        isActive: true,
      });

      const namespace = this.server.create('organization-namespace', {
        value: 'com.mfva.test',
        createdOn: new Date(),
        approvedOn: new Date(),
        isApproved: true,
        organization: organization,
        requestedBy: org_user_requestedby,
        approvedBy: org_user_approvedby,
        platform: 1,
      });

      this.notification = this.server.create('nf-in-app-notification', {
        hasRead: true,
        messageCode: 'NF_STR_URL_NSREQSTD1',
        context: new ContextClass({
          namespace_id: namespace.id,
          namespace_created_on: new Date(),
          namespace_value: 'com.mfva.test',
          platform: 1,
          platform_display: 'android',
          requester_username: 'appknox_requester',
          store_url: 'https://play.google.com/mfva',
        }),
      });

      this.context = this.notification.context;

      await render(hbs`<NotificationsPage::Messages::NfStrUrlNsreqstd1 @notification={{this.notification}}
      @context={{this.context}}/>`);

      assert
        .dom('[data-test-namespaceMessage-title]')
        .hasText(t('approvalRequest'));

      assert.dom('[data-test-namespaceMessage-primary-message]').hasText(
        t('notificationModule.messages.nf-str-url-nsreqstd1', {
          requester_username: 'appknox_requester',
          platform_display: 'android',
          namespace_value: 'com.mfva.test',
        })
      );

      assert.dom('[data-test-namespaceMessage-approved-message]').hasText(
        t('notificationModule.namespaceMessage.approved', {
          moderaterName: 'appknox_approver',
        })
      );

      assert.dom('[data-test-namespaceMessage-approved-icon]').exists();

      assert
        .dom('[data-test-namespaceMessage-viewAppOnStorelink]')
        .exists()
        .hasText(t('notificationModule.viewAppOnStore'));
    });

    test('it should show rejected state if namespace is rejected', async function (assert) {
      this.notification = this.server.create('nf-in-app-notification', {
        hasRead: true,
        messageCode: 'NF_STR_URL_NSREQSTD1',
        context: new ContextClass({
          namespace_id: 2000,
          namespace_created_on: new Date(),
          namespace_value: 'com.mfva.test',
          platform: 1,
          platform_display: 'android',
          requester_username: 'appknox_requester',
          store_url: 'https://play.google.com/mfva',
        }),
      });

      this.context = this.notification.context;

      await render(hbs`<NotificationsPage::Messages::NfStrUrlNsreqstd1 @notification={{this.notification}}
      @context={{this.context}}/>`);

      assert
        .dom('[data-test-namespaceMessage-title]')
        .hasText(t('approvalRequest'));

      assert.dom('[data-test-namespaceMessage-primary-message]').hasText(
        t('notificationModule.messages.nf-str-url-nsreqstd1', {
          requester_username: 'appknox_requester',
          platform_display: 'android',
          namespace_value: 'com.mfva.test',
        })
      );

      assert
        .dom('[data-test-namespaceMessage-rejected-message]')
        .hasText(t('notificationModule.namespaceMessage.rejected'));

      assert.dom('[data-test-namespaceMessage-rejected-icon]').exists();

      assert
        .dom('[data-test-namespaceMessage-viewAppOnStorelink]')
        .exists()
        .hasText(t('notificationModule.viewAppOnStore'));
    });

    test('it should show approve and reject for unmoderated namespace', async function (assert) {
      const organization = this.server.schema.organizations.first();

      const org_user_requestedby = this.server.create('organization-user', {
        username: 'appknox_requester',
        email: 'appknox_requester@test.com',
        isActive: true,
      });

      const namespace = this.server.create('organization-namespace', {
        value: 'com.mfva.test',
        createdOn: new Date(),
        approvedOn: null,
        isApproved: false,
        organization: organization,
        requestedBy: org_user_requestedby,
        approvedBy: null,
        platform: 1,
      });

      this.notification = this.server.create('nf-in-app-notification', {
        hasRead: true,
        messageCode: 'NF_STR_URL_NSREQSTD1',
        context: new ContextClass({
          namespace_id: namespace.id,
          namespace_created_on: new Date(),
          namespace_value: 'com.mfva.test',
          platform: 1,
          platform_display: 'android',
          requester_username: 'appknox_requester',
          store_url: 'https://play.google.com/mfva',
        }),
      });

      this.context = this.notification.context;

      await render(hbs`<NotificationsPage::Messages::NfStrUrlNsreqstd1 @notification={{this.notification}}
      @context={{this.context}}/>`);

      assert
        .dom('[data-test-namespaceMessage-title]')
        .hasText(t('approvalRequest'));

      assert.dom('[data-test-namespaceMessage-primary-message]').hasText(
        t('notificationModule.messages.nf-str-url-nsreqstd1', {
          requester_username: 'appknox_requester',
          platform_display: 'android',
          namespace_value: 'com.mfva.test',
        })
      );

      assert.dom('[data-test-namespaceMessage-approve-button]').exists();

      assert.dom('[data-test-namespaceMessage-reject-button]').exists();

      assert
        .dom('[data-test-namespaceMessage-viewNamespacelink]')
        .exists()
        .hasText(t('notificationModule.viewNamespaces'));

      assert
        .dom('[data-test-namespaceMessage-viewAppOnStorelink]')
        .exists()
        .hasText(t('notificationModule.viewAppOnStore'));
    });

    test('it should approve namespace when approve is clicked for unmoderated namespace', async function (assert) {
      const organization = this.server.schema.organizations.first();

      const org_user_requestedby = this.server.create('organization-user', {
        username: 'appknox_requester',
        email: 'appknox_requester@test.com',
        isActive: true,
      });

      const namespace = this.server.create('organization-namespace', {
        value: 'com.mfva.test',
        createdOn: new Date(),
        approvedOn: null,
        isApproved: false,
        organization: organization,
        requestedBy: org_user_requestedby,
        approvedBy: null,
        platform: 1,
      });

      this.notification = this.server.create('nf-in-app-notification', {
        hasRead: true,
        messageCode: 'NF_STR_URL_NSREQSTD1',
        context: new ContextClass({
          namespace_id: namespace.id,
          namespace_created_on: new Date(),
          namespace_value: 'com.mfva.test',
          platform: 1,
          platform_display: 'android',
          requester_username: 'appknox_requester',
          store_url: 'https://play.google.com/mfva',
        }),
      });

      this.context = this.notification.context;

      await render(hbs`<NotificationsPage::Messages::NfStrUrlNsreqstd1 @notification={{this.notification}}
      @context={{this.context}}/>`);

      assert
        .dom('[data-test-namespaceMessage-title]')
        .hasText(t('approvalRequest'));

      assert.dom('[data-test-namespaceMessage-primary-message]').hasText(
        t('notificationModule.messages.nf-str-url-nsreqstd1', {
          requester_username: 'appknox_requester',
          platform_display: 'android',
          namespace_value: 'com.mfva.test',
        })
      );

      assert
        .dom('[data-test-namespaceMessage-viewNamespacelink]')
        .exists()
        .hasText(t('notificationModule.viewNamespaces'));

      assert
        .dom('[data-test-namespaceMessage-viewAppOnStorelink]')
        .exists()
        .hasText(t('notificationModule.viewAppOnStore'));

      assert.dom('[data-test-namespaceMessage-approve-button]').exists();
      assert.dom('[data-test-namespaceMessage-reject-button]').exists();

      await click('[data-test-namespaceMessage-approve-button]');

      assert.dom('[data-test-namespaceMessage-approve-button]').doesNotExist();
      assert.dom('[data-test-namespaceMessage-reject-button]').doesNotExist();

      assert.dom('[data-test-namespaceMessage-primary-message]').hasText(
        t('notificationModule.messages.nf-str-url-nsreqstd1', {
          requester_username: 'appknox_requester',
          platform_display: 'android',
          namespace_value: 'com.mfva.test',
        })
      );

      assert.dom('[data-test-namespaceMessage-approved-message]').hasText(
        t('notificationModule.namespaceMessage.approved', {
          moderaterName: 'You',
        })
      );
      assert.dom('[data-test-namespaceMessage-approved-icon]').exists();
    });

    test('it should reject namespace when reject is clicked for unmoderated namespace', async function (assert) {
      const organization = this.server.schema.organizations.first();

      const org_user_requestedby = this.server.create('organization-user', {
        username: 'appknox_requester',
        email: 'appknox_requester@test.com',
        isActive: true,
      });

      const namespace = this.server.create('organization-namespace', {
        value: 'com.mfva.test',
        createdOn: new Date(),
        approvedOn: null,
        isApproved: false,
        organization: organization,
        requestedBy: org_user_requestedby,
        approvedBy: null,
        platform: 1,
      });

      this.notification = this.server.create('nf-in-app-notification', {
        hasRead: true,
        messageCode: 'NF_STR_URL_NSREQSTD1',
        context: new ContextClass({
          namespace_id: namespace.id,
          namespace_created_on: new Date(),
          namespace_value: 'com.mfva.test',
          platform: 1,
          platform_display: 'android',
          requester_username: 'appknox_requester',
          store_url: 'https://play.google.com/mfva',
        }),
      });

      this.context = this.notification.context;

      await render(hbs`<NotificationsPage::Messages::NfStrUrlNsreqstd1 @notification={{this.notification}}
      @context={{this.context}}/>`);

      assert
        .dom('[data-test-namespaceMessage-title]')
        .hasText(t('approvalRequest'));

      assert.dom('[data-test-namespaceMessage-primary-message]').hasText(
        t('notificationModule.messages.nf-str-url-nsreqstd1', {
          requester_username: 'appknox_requester',
          platform_display: 'android',
          namespace_value: 'com.mfva.test',
        })
      );

      assert
        .dom('[data-test-namespaceMessage-viewNamespacelink]')
        .exists()
        .hasText(t('notificationModule.viewNamespaces'));

      assert
        .dom('[data-test-namespaceMessage-viewAppOnStorelink]')
        .exists()
        .hasText(t('notificationModule.viewAppOnStore'));

      assert.dom('[data-test-namespaceMessage-approve-button]').exists();
      assert.dom('[data-test-namespaceMessage-reject-button]').exists();

      await click('[data-test-namespaceMessage-reject-button]');

      assert.dom('[data-test-namespaceMessage-approve-button]').doesNotExist();
      assert.dom('[data-test-namespaceMessage-reject-button]').doesNotExist();

      assert.dom('[data-test-namespaceMessage-primary-message]').hasText(
        t('notificationModule.messages.nf-str-url-nsreqstd1', {
          requester_username: 'appknox_requester',
          platform_display: 'android',
          namespace_value: 'com.mfva.test',
        })
      );

      assert
        .dom('[data-test-namespaceMessage-rejected-message]')
        .hasText(t('notificationModule.namespaceMessage.rejected'));

      assert.dom('[data-test-namespaceMessage-rejected-icon]').exists();
    });
  }
);
