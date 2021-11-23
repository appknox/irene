import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import ENV from 'irene/config/environment';
import Service from '@ember/service';

class NotificationsStub extends Service {
  errorMsg = null;
  successMsg = null;
  error(msg) {
    return (this.errorMsg = msg);
  }
  success(msg) {
    return (this.successMsg = msg);
  }
}

module('Integration | Component | jira-integration', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    await this.server.createList('organization', 2);
    await this.owner.lookup('service:organization').load();
    this.owner.register('service:notifications', NotificationsStub);
  });

  test('it should render on-premise integration', async function (assert) {
    ENV.showJiraCloud = false;
    this.server.get('organizations/:orgId/integrate_jira', () => {
      return Response(404);
    });
    await render(hbs`<JiraIntegration />`);
    assert.dom(`[data-test-jira-cloud-integration]`).doesNotExist();
    assert.dom(`[data-test-jira-on-premise-integration-title]`).exists();
    assert
      .dom(`[data-test-jira-on-premise-integration-title]`)
      .hasText(`t:jiraOnPremiseIntegration:()`);
    assert.dom(`[data-test-jira-on-premise-integration-form]`).exists();
    assert.dom(`[data-test-jira-integrated]`).doesNotExist();
  });

  test('it should render both cloud & on-premise integration', async function (assert) {
    ENV.showJiraCloud = true;
    await render(hbs`<JiraIntegration />`);

    assert.dom(`[data-test-jira-cloud-integration]`).exists();
    assert.dom(`[data-test-jira-on-premise-integration-title]`).exists();
    assert
      .dom(`[data-test-jira-cloud-integration-title]`)
      .hasText(`t:jiraCloudIntegration:()`);
    assert.dom(`[data-test-jira-cloud-integration-btn]`).exists();
    assert.dom(`[data-test-jira-integrated]`).doesNotExist();
  });

  test('it should render jira cloud integrated container', async function (assert) {
    ENV.showJiraCloud = true;
    this.server.get('organizations/:orgId/integrate_jira', () => {
      return {
        type: 'jira_cloud_oauth',
        accounts: 'http://test.com',
      };
    });
    await render(hbs`<JiraIntegration />`);

    assert.dom(`[data-test-jira-on-premise-integration-title]`).doesNotExist();
    assert.dom(`[data-test-jira-cloud-integration-title]`).exists();
    assert.dom(`[data-test-jira-cloud-integration-btn]`).doesNotExist();
    assert.dom(`[data-test-jira-integrated-host]`).hasText('http://test.com');
  });

  test('it should render jira on-premise integrated container', async function (assert) {
    this.server.get('organizations/:orgId/integrate_jira', () => {
      return {
        type: 'jira',
        host: 'http://test.com',
        username: 'testuser',
      };
    });
    await render(hbs`<JiraIntegration />`);

    assert.dom(`[data-test-jira-on-premise-integration-title]`).exists();
    assert.dom(`[data-test-jira-cloud-integration-title]`).doesNotExist();
    assert.dom(`[data-test-jira-cloud-integration-btn]`).doesNotExist();
    assert.dom(`[data-test-jira-integrated-host]`).hasText('http://test.com');
    assert.dom(`[data-test-jira-integrated-username]`).hasText('testuser');
  });

  test('it should render jira integrated container', async function (assert) {
    this.server.get('organizations/:orgId/integrate_jira', () => {
      return {
        type: 'jira',
        host: 'http://test.com',
        username: 'testuser',
      };
    });
    await render(hbs`<JiraIntegration />`);

    assert
      .dom(`[data-test-jira-logo]`)
      .hasAttribute('src', '/images/jira-icon.png');
    assert.dom(`[data-test-jira-integrated-host]`).hasText('http://test.com');
    assert.dom(`[data-test-jira-integrated-username]`).hasText('testuser');
    assert.dom(`[data-test-jira-disconnect-btn]`).hasText(`t:disconnect:()`);
  });

  test('it should handle disconnect jira integration', async function (assert) {
    this.server.get('organizations/:orgId/integrate_jira', () => {
      return {
        type: 'jira',
        host: 'http://test.com',
        username: 'testuser',
      };
    });

    this.server.delete('organizations/:orgId/integrate_jira', () => {
      return {};
    });
    await render(hbs`<JiraIntegration />`);

    assert.dom(`[data-test-jira-disconnect-confirm-label]`).doesNotExist();
    await click(`[data-test-jira-disconnect-btn]`);
    assert.dom(`[data-test-jira-disconnect-confirm-label]`).exists();
    assert
      .dom(`[data-test-jira-disconnect-confirm-label]`)
      .hasText(`t:confirmBox.revokeJira:()`);
    assert.dom(`[data-test-jira-disconnect-confirm-ok-btn]`).hasText(`t:ok:()`);
    assert
      .dom(`[data-test-jira-disconnect-confirm-cancel-btn]`)
      .hasText(`t:cancel:()`);

    await click(`[data-test-jira-disconnect-confirm-ok-btn]`);
    this.notifyService = this.owner.lookup('service:notifications');
    assert.equal(
      this.notifyService.get('successMsg'),
      `t:jiraWillBeRevoked:()`
    );
    assert.dom(`[data-test-jira-disconnect-confirm-label]`).doesNotExist();
  });

  test('it should close confirm modal while clicking at cancel btn', async function (assert) {
    this.server.get('organizations/:orgId/integrate_jira', () => {
      return {
        type: 'jira',
        host: 'http://test.com',
        username: 'testuser',
      };
    });

    await render(hbs`<JiraIntegration />`);

    assert.dom(`[data-test-jira-disconnect-confirm-label]`).doesNotExist();
    await click(`[data-test-jira-disconnect-btn]`);
    assert.dom(`[data-test-jira-disconnect-confirm-label]`).exists();

    await click(`[data-test-jira-disconnect-confirm-cancel-btn]`);

    assert.dom(`[data-test-jira-disconnect-confirm-label]`).doesNotExist();
  });

  test('it should handle disconnect jira integration failed', async function (assert) {
    this.server.get('organizations/:orgId/integrate_jira', () => {
      return {
        type: 'jira',
        host: 'http://test.com',
        username: 'testuser',
      };
    });

    this.server.delete('organizations/:orgId/integrate_jira', () => {
      return Response(500);
    });
    await render(hbs`<JiraIntegration />`);

    await click(`[data-test-jira-disconnect-btn]`);

    await click(`[data-test-jira-disconnect-confirm-ok-btn]`);
    this.notifyService = this.owner.lookup('service:notifications');
    assert.equal(
      this.notifyService.get('errorMsg'),
      'Request was rejected due to server error'
    );
    assert.dom(`[data-test-jira-disconnect-confirm-label]`).doesNotExist();
  });
});
