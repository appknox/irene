import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupRequiredEndpoints } from 'irene/tests/helpers/acceptance-utils';
import { setupFileModelEndpoints } from 'irene/tests/helpers/file-model-utils';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Acceptance | hide-upsell-features', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test.each(
    'test does not show upsell feature for all upsell pages',
    [
      {
        feature: 'sbom',
        route: '/dashboard/sbom/apps',
        redirectRoute: '/dashboard/projects',
      },
      {
        feature: 'privacy',
        route: '/dashboard/privacy-module',
        redirectRoute: '/dashboard/projects',
      },
      {
        feature: 'dast_automation',
        route: '/dashboard/project/1/settings/dast-automation',
        redirectRoute: '/dashboard/project/1/settings',
        models_info: [{ id: 1, name: 'project' }],
      },
      {
        feature: 'dynamicscan_automation',
        route: '/dashboard/file/1/dynamic-scan/automated',
        redirectRoute: '/dashboard/file/1/dynamic-scan/manual',
        models_info: [
          { id: 1, name: 'file', props: { project: 1 } },
          { id: 1, name: 'profile' },
          { id: 1, name: 'project', props: { active_profile_id: 1, file: 1 } },
        ],
      },
      {
        feature: 'storeknox',
        // For brand abuse and malware detected, the upsell features would always be visible even if storeknox is enabled
        featureState: true,
        route: '/dashboard/storeknox/inventory-details/1/brand-abuse',
        redirectRoute: '/dashboard/storeknox/inventory-details/1',
        models_info: [
          { id: 1, name: 'sk-inventory-app' },
          { id: 1, name: 'file', props: { project: 1 } },
          { id: 1, name: 'profile' },
          { id: 1, name: 'project', props: { active_profile_id: 1, file: 1 } },
        ],
      },
    ],
    async function (
      assert,
      { feature, featureState = false, redirectRoute, route, models_info }
    ) {
      const { organization } = await setupRequiredEndpoints(this.server);
      setupFileModelEndpoints(this.server);

      // Hide upsell feature UIs and toggle feature off
      organization.update({
        hide_upsell_features: true,
        features: { [feature]: featureState },
      });

      // Create models for route
      for (const model of models_info ?? []) {
        this.server.create(model.name, { id: model.id, ...model.props });
      }

      // Server mocks
      this.server.get('/v2/server_configuration', () => {
        return { enterprise: false };
      });

      this.server.get('/v3/projects/:id', (schema, req) => {
        return schema.projects.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/v3/files/:id', (schema, req) => {
        return schema.files.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/profiles/:id', (schema, req) =>
        schema.profiles.find(`${req.params.id}`)?.toJSON()
      );

      // Server mocks
      this.server.get('v2/sk_app_detail/:id', (schema, req) => {
        const app = schema.skInventoryApps.find(req.params.id);

        return { ...app.toJSON(), app_metadata: app.app_metadata };
      });

      this.server.get('/v2/sk_organization', (schema) => {
        const skOrganizations = schema.skOrganizations.all().models;

        return {
          count: skOrganizations.length,
          next: null,
          previous: null,
          results: skOrganizations,
        };
      });

      this.server.get('/profiles/:id/api_scan_options', (_, req) => {
        return {
          ds_api_capture_filters: '',
          id: req.params.id,
        };
      });

      this.server.get(
        '/organizations/:id/projects/:projectID/collaborators',
        () => {
          return {
            count: 0,
            next: null,
            previous: null,
            results: [],
          };
        }
      );

      this.server.get('/organizations/:id/projects/:projectID/teams', () => {
        return {
          count: 0,
          next: null,
          previous: null,
          results: [],
        };
      });

      // Visit upsell route
      await visit(route);

      // Should redirect to projects
      assert.strictEqual(
        currentURL(),
        redirectRoute,
        `Redirected to ${redirectRoute}`
      );
    }
  );
});
