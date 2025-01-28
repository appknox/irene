import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import Service from '@ember/service';
import { setupRequiredEndpoints } from '../../helpers/acceptance-utils';

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

module('Acceptance | projects redirect', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const { vulnerabilities } = await setupRequiredEndpoints(this.server);

    const profile = this.server.create('profile');

    const file = this.server.create('file', 1);

    const project = this.server.create('project', {
      id: 1,
      last_file_id: file.id,
    });

    const analyses = vulnerabilities.map((v, id) =>
      this.server.create('analysis', { id, vulnerability: v.id }).toJSON()
    );

    this.server.get('/profiles/:id/vulnerability_preferences', (schema) => {
      return schema['vulnerabilityPreferences'].all().models;
    });

    this.server.createList('file', 3, {
      project: project.id,
      profile: profile.id,
      analyses,
    });

    this.server.get('/profiles/:id/unknown_analysis_status', (_, req) => {
      return {
        id: req.params.id,
        status: true,
      };
    });

    this.server.get('/projects/:id/files', (schema) => {
      const files = schema.files.all().models;

      return {
        count: files.length,
        next: null,
        previous: null,
        results: files,
      };
    });

    this.server.get('v2/profiles/:id/automation_preference', (_, req) => {
      return { id: req.params.id, dynamic_scan_automation_enabled: true };
    });

    this.server.create('proxy-setting', { id: profile.id });

    this.owner.register('service:integration', IntegrationStub);
    this.owner.register('service:websocket', WebsocketStub);

    this.server.get('/v2/projects/:id', (schema, req) => {
      return schema.projects.find(req.params.id).toJSON();
    });

    this.server.get('/profiles/:id', (schema, req) =>
      schema.profiles.find(`${req.params.id}`)?.toJSON()
    );

    this.server.get(
      '/v2/profiles/:id/ds_automated_device_preference',
      (schema, req) => {
        return schema.dsAutomatedDevicePreferences
          .find(`${req.params.id}`)
          ?.toJSON();
      }
    );

    this.server.get('/profiles/:id/proxy_settings', (schema, req) => {
      return schema.proxySettings.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/profiles/:id/api_scan_options', (_, req) => ({
      id: req.params.id,
      api_url_filters: '',
    }));

    this.server.get(
      '/organizations/:id/projects/:projectId/collaborators',
      (schema) => {
        const results = schema.projectCollaborators.all().models;

        return { count: results.length, next: null, previous: null, results };
      }
    );

    this.server.get(
      '/organizations/:orgId/projects/:projectId/teams',
      (schema) => {
        const results = schema.projectTeams.all().models;

        return { count: results.length, next: null, previous: null, results };
      }
    );

    this.server.get('/v2/scan_parameter_groups/:id', (schema, req) =>
      schema.scanParameterGroups.find(req.params.id).toJSON()
    );

    this.server.get(
      '/v2/projects/:projectId/scan_parameter_groups/:id',
      (schema, req) => schema.scanParameterGroups.find(req.params.id).toJSON()
    );

    this.server.get(
      '/v2/projects/:projectId/scan_parameter_groups',
      function (schema) {
        const data = schema.scanParameterGroups.all().models;

        return {
          count: data.length,
          next: null,
          previous: null,
          results: data,
        };
      }
    );

    this.server.get(
      '/v2/scan_parameter_groups/:id/scan_parameters',
      (schema) => {
        const data = schema.scanParameters.all().models;

        return {
          count: data.length,
          next: null,
          previous: null,
          results: data,
        };
      }
    );

    this.server.get(
      '/organizations/:id/github_repos',
      () => new Response(404, {}, { detail: 'Github not integrated' })
    );

    this.server.get(
      '/projects/:id/github',
      () => new Response(400, {}, { detail: 'Github not integrated' })
    );

    this.server.get(
      '/organizations/:id/jira_projects',
      () => new Response(404, {}, { detail: 'JIRA not integrated' })
    );

    this.server.get(
      '/projects/:id/jira',
      () => new Response(404, {}, { detail: 'JIRA not integrated' })
    );

    this.server.get('/v2/files/:id', (schema, req) => {
      return schema.files.find(`${req.params.id}`)?.toJSON();
    });

    // to dismiss notification quickly
    const notify = this.owner.lookup('service:notifications');

    notify.setDefaultClearDuration(0);

    this.owner.register('service:integration', IntegrationStub);
    this.owner.register('service:websocket', WebsocketStub);
  });

  test('It redirects to authenticated.dashboard.projects route', async function (assert) {
    const notify = this.owner.lookup('service:notifications');

    notify.setDefaultClearDuration(0);

    const scenario = this.server.create('scan-parameter-group', {
      id: '1',
      project: 1,
      name: 'Default',
      is_active: false,
      is_default: true,
    });

    await visit('/projects');

    assert.strictEqual(currentURL(), '/dashboard/projects');

    await visit('/project/1/files');

    assert.strictEqual(currentURL(), '/dashboard/project/1/files');

    await visit('/project/1/settings');

    assert.strictEqual(currentURL(), '/dashboard/project/1/settings');

    await visit('/project/1/settings/analysis');

    assert.strictEqual(currentURL(), '/dashboard/project/1/settings/analysis');

    await visit(`/project/1/settings/dast-automation-scenario/${scenario.id}`);

    assert.strictEqual(
      currentURL(),
      `/dashboard/project/1/settings/dast-automation-scenario/${scenario.id}`
    );
  });
});
