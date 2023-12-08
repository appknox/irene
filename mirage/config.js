import config from 'irene/config/environment';
import { Response } from 'miragejs';

import {
  createServer,
  discoverEmberDataModels,
  applyEmberDataSerializers,
} from 'ember-cli-mirage';

export default function makeServer(config) {
  let finalConfig = {
    ...config,
    models: {
      ...discoverEmberDataModels(),
      ...config.models,
    },
    serializers: applyEmberDataSerializers(config.serializers),
    routes,
  };

  return createServer(finalConfig);
}

function routes() {
  this.passthrough('/write-coverage');
  this.urlPrefix = config.host;

  // NOTE v2 api namespace has to be grouped together
  this.post('/api/v2/sso/check', () => {
    return {
      is_sso: false,
      is_sso_enforced: false,
    };
  });

  this.get('/api/v2/partnerclients', (schema) => {
    return schema.partnerClients.all();
  });

  this.get('/api/v2/partnerclients/:id', (schema, FakeRequest) => {
    return schema.partnerClients.find({
      id: FakeRequest.queryParams.id,
    });
  });

  this.get('/api/v2/partnerclients/:id/plan', () => {
    return this.db.partnerclientPlans[0];
  });

  this.get('/api/v2/frontend_configuration', () => {
    return {
      hide_poweredby_logo: true,
      images: {
        favicon: '',
        logo_on_darkbg: '',
        logo_on_lightbg: '',
      },
      integrations: {
        crisp_key: '',
        csb_key: '',
        hotjar_key: '',
        pendo_key: '',
        rollbar_key: '',
      },
      name: '',
      registration_enabled: true,
      registration_link: '',
      theme: {
        primary_alt_color: '',
        primary_color: '',
        scheme: 'dark',
        secondary_alt_color: '',
        secondary_color: '',
      },
      url: '',
    };
  });

  this.get('/api/hudson-api/reports/:fileId/download_url', () => {
    return {};
  });

  this.put('/api/hudson-api/reports/:fileId', () => {
    return {};
  });

  this.namespace = config.namespace;

  this.get('/v2/projects/:id', (schema, req) => {
    return schema.projects.find(`${req.params.id}`)?.toJSON();
  });

  this.get('/v2/files/:id', (schema, req) => {
    return schema.files.find(`${req.params.id}`)?.toJSON();
  });

  this.get('/organizations/:id/projects', (schema) => {
    return schema.projects.all().models;
  });

  this.put('/organizations/:id', () => {
    return {};
  });

  this.get('/organizations/:id/preference', () => {
    return {};
  });

  this.get('/organizations/:id/sso/saml2', () => {
    return {};
  });

  this.put('/organizations/:id/sso/saml2', () => {
    return {};
  });

  this.get('/v2/sso/saml2/metadata', () => {
    return {};
  });

  this.get('/organizations/:id/sso/saml2/idp_metadata', () => {
    return {};
  });

  this.delete('/organizations/:id/sso/saml2/idp_metadata', () => {
    return {};
  });

  this.get('/organizations/:id/archives', () => {
    return [];
  });

  this.post('/organizations/:id/archives', () => {
    return {};
  });

  this.get('/organizations/:id/email_domains', () => {
    return [];
  });

  this.get('/organizations/:id/teams', (schema) => {
    return schema.organizationTeams.all().models;
  });

  this.post('/organizations/:id/teams', () => {
    return {};
  });

  this.get('/organizations/:id/teams/:teamId', () => {
    return {};
  });

  this.post('/organizations/:id/teams/:teamId', () => {
    return {};
  });

  this.delete('/organizations/:id/teams/:teamId', () => {
    return {};
  });

  this.get('/organizations/:id/teams/:teamId/members', (schema) => {
    return schema.organizationUsers.all().models;
  });

  this.get('/organizations/:id/teams/:teamId/projects', (schema) => {
    return schema.organizationProjects.all().models;
  });

  this.put('/organizations/:id/teams/:teamId/projects/:projectId', () => {
    return {};
  });

  this.get('/organizations/:id/teams/:teamId/invitations', (schema) => {
    return schema.organizationInvitations.all().models;
  });

  this.get('/organizations/:id/namespaces', function (schema, request) {
    let data = schema.organizationNamespaces.all();
    let limit = data.length;
    let offset = 0;
    if (request.queryParams.limit) {
      limit = request.queryParams.limit;
    }
    if (request.queryParams.offset) {
      offset = request.queryParams.offset;
    }

    const retdata = data.slice(offset, offset + limit);
    return {
      count: data.length,
      next: null,
      previous: null,
      results: this.serialize(retdata).organizationNamespaces,
    };
  });

  this.get(
    '/organizations/:id/namespaces/:namespaceId',
    function (schema, request) {
      const namespace = schema.organizationNamespaces.find(
        request.params.namespaceId
      );
      if (!namespace) {
        return new Response(
          404,
          {},
          {
            detail: 'Not found.',
          }
        );
      }
      return this.serialize(namespace).organizationNamespace;
    }
  );

  this.put(
    '/organizations/:id/namespaces/:namespaceId',
    function (schema, request) {
      const namespace = schema.organizationNamespaces.find(
        request.params.namespaceId
      );
      if (!namespace) {
        return new Response(
          404,
          {},
          {
            detail: 'Not found.',
          }
        );
      }
      const currentUser = schema.currentUsers.first();
      let orgUser = schema.organizationUsers.find(currentUser.id);
      if (!orgUser) {
        orgUser = this.server.create('organization-user', {
          id: currentUser.id,
          username: 'appknox_requester',
          email: 'appknox_requester@test.com',
          isActive: true,
        });
      }
      const body = JSON.parse(request.requestBody);
      let updateObject = { isApproved: body.is_approved };

      if (updateObject.isApproved) {
        updateObject = {
          ...updateObject,
          approvedBy: orgUser,
          approvedOn: new Date(),
        };
      }
      namespace.update(updateObject);
      return this.serialize(namespace).organizationNamespace;
    }
  );

  this.delete(
    '/organizations/:id/namespaces/:namespaceId',
    function (schema, request) {
      const namespace = schema.organizationNamespaces.find(
        request.params.namespaceId
      );
      if (!namespace) {
        return new Response(
          404,
          {},
          {
            detail: 'Not found.',
          }
        );
      }
      namespace.destroy();
      return new Response(204, {}, '');
    }
  );

  this.get('/organizations/:id/users', (schema) => {
    return schema.organizationUsers.all().models;
  });

  this.get('/organizations/:id/users/:userId', function (schema, request) {
    const orgUser = schema.organizationUsers.find(request.params.userId);
    if (!orgUser) {
      return new Response(
        404,
        {},
        {
          detail: 'Not found.',
        }
      );
    }
    return this.serialize(orgUser).organizationUser;
  });

  this.put('/organizations/:id/users/:userId', () => {
    return {};
  });

  this.get('/organizations/:id/integrate_jira', () => {
    return {};
  });

  this.delete('/organizations/:id/integrate_jira', () => {
    return {};
  });

  this.post('/organizations/:id/integrate_jira', () => {
    return {};
  });

  this.get('/organizations/:id/github/redirect', () => {
    return {};
  });

  this.delete('/organizations/:id/github', () => {
    return {};
  });

  this.get('/profiles/:id/unknown_analysis_status', 'unknown-analysis-status');

  this.get('/users/:id', (schema, req) => {
    return {
      data: {
        attributes: schema.users.find(`${req.params.id}`)?.toJSON(),
        id: req.params.id,
        relationships: {},
        type: 'users',
      },
    };
  });

  // this.get('/users', 'user');

  this.get('/projects/:id', 'project');
  this.get('/projects', 'project');
  this.get('/pricings', 'pricing');
  this.get('/plans', 'plan');
  this.get('/pricings/:id', 'pricing');
  this.get('/teams', 'team');
  this.get('/organizations', (schema) => {
    return schema.organizations.all().models;
  });
  this.get('/teams/:id', 'team');
  this.get('/submissions/:id', 'submission');
  this.get('/submissions', 'submission');
  this.get('/files/:id', 'file');
  this.get('/vulnerabilities/:id', 'vulnerability');

  this.get('/vulnerabilities', (schema) => {
    return {
      data: schema.vulnerabilities.all().models.map((model) => ({
        attributes: model,
        id: model.id,
        relationships: {},
        type: 'vulnerabilities',
      })),
    };
  });

  this.get('/invitations/:id', 'invitation');
  this.get('/devices', 'device');
  this.get('/invoices', 'invoice');
  this.get('/invoices/:id', 'invoice');
  this.get('/attachments/:id', 'attachment');
  this.get('/invitations/', 'invitation');
  this.get('/subscriptions/', 'subscription');
  this.get('/profiles/:id/github_integration');
  this.get('/profiles/:id/jira_integration');
  this.get(
    '/profiles/:id/vulnerability_preferences',
    'vulnerability-preference'
  );
  this.get('/available_devices/', 'available-device');
  this.get('/subscriptions/', 'subscription');
  this.get('/organization/:id/analytics', 'analytics');
  this.get('/personaltokens', 'personaltoken');
  this.get('/manualscans/:id', 'manualscan');

  this.get('/github_repos', () => {
    return {};
  });

  this.get('/signed_url/', () => {
    return {};
  });

  this.get('/signed_pdf_url/:id', () => {
    return {};
  });

  this.get('/dynamic/:id', () => {
    return {};
  });

  this.get('/manual/:id', () => {
    return {};
  });

  this.get('/jira_projects', () => {
    return {};
  });

  this.get('/files/', (schema, FakeRequest) => {
    return schema.files.find({
      id: FakeRequest.queryParams.projectId,
    });
  });

  this.post('/signup', () => {
    return {
      user_id: '1',
      token: 'secret',
    };
  });

  this.post('/login', () => {
    return {
      user_id: '1',
      token: 'secret',
    };
  });

  this.post('/check', () => {
    return {
      user_id: '1',
      token: 'secret',
    };
  });

  this.post('/logout', () => {
    return {};
  });

  this.post('/set_github/:id', () => {
    return {};
  });

  this.put('/manualscans/:id', () => {
    return {};
  });

  this.put('/files/:id/vulnerability_preferences/:id/risk', () => {
    return {};
  });

  this.delete('/files/:id/vulnerability_preferences/:id/risk', () => {
    return {};
  });

  this.put('/files/:id/vulnerability_preferences/:id/ignore', () => {
    return {};
  });

  this.put('/profiles/:id/vulnerability_preferences/:id', () => {
    return {};
  });

  this.put('/profiles/:id/unknown_analysis_status', () => {
    return {};
  });

  this.put('/profiles/:id/report_preference', () => {
    return {};
  });

  this.post('/personaltokens', () => {
    return {};
  });

  this.put('/dynamicscan/:id', () => {
    return {};
  });

  this.delete('/dynamicscan/:id', () => {
    return {};
  });

  this.post('/integrate_jira', () => {
    return {};
  });

  this.delete('/personaltokens/:id', () => {
    return {};
  });

  this.get('/organizations/:id', () => {
    return {};
  });

  this.put('/organizations/:id/teams/:id/members', () => {
    return {};
  });

  this.delete('/organizations/:id/teams/:id/members/:member', () => {
    return {};
  });

  this.post('/set_jira/:id', () => {
    return {};
  });

  this.post('/lang', () => {
    return {};
  });

  this.put('/profiles/:id/device_preference', () => {
    return {
      id: '1',
    };
  });

  this.post('/namespace_add', () => {
    return {};
  });

  this.post('/apply_coupon', () => {
    return {};
  });

  this.post('/unauthorize_github', () => {
    return {};
  });

  this.post('/unauthorize_jira', () => {
    return {};
  });

  this.post('/change_password', () => {
    return {};
  });

  this.post('/recover', () => {
    return {};
  });

  this.post('/invitations', () => {
    return {};
  });

  this.post('/reset', () => {
    return {};
  });

  this.post('/setup', () => {
    return {};
  });

  this.delete('/delete_github_repo/:id', () => {
    return {};
  });

  this.get('/dynamic_shutdown//:id', () => {
    return {};
  });

  this.delete('/delete_jira_project/:id', () => {
    return {};
  });

  this.put('/profiles/:id/api_scan_options', () => {
    return {};
  });

  this.post('/api_scan_options/:id', () => {
    return {};
  });

  this.get('/invoices/:id/download_url', () => {
    return {};
  });

  this.get('/attachments/:id/download_url', () => {
    return {};
  });

  this.get('/user_search?q=yash', () => {
    return {};
  });

  this.post('/chargebee/callback', () => {
    return {};
  });

  this.post('/mfa/enable', () => {
    return {};
  });

  this.post('mfa/disable', () => {
    return {};
  });

  this.post('/teams', () => {
    return;
  });

  this.post('/rescan', () => {
    return;
  });

  this.post('/teams/:id', () => {
    return;
  });

  this.post('/teams/:id/members', () => {
    return;
  });

  this.put('/teams/:id/members', () => {
    return;
  });

  this.delete('/teams/:id/members/yash', () => {
    return;
  });

  this.delete('/teams/:id', () => {
    return;
  });

  this.delete('/teams', () => {
    return;
  });

  this.delete('/subscriptions/:id', () => {
    return {};
  });

  this.get('/example/download_url', () => {
    return {};
  });

  this.get('/organizations/:id/members', (schema) => {
    return schema.organizationMembers.all().models;
  });

  this.get('/organizations/:orgId/members/:memId', (schema, request) => {
    return schema.organizationMembers.find(request.params.memId)?.toJSON();
  });

  this.put('/organizations/:orgId/members/:memId', () => {
    return {};
  });

  this.post('/organizations/:orgId/members/:memId', () => {
    return {};
  });

  this.get('/organizations/:id/invitations', (schema) => {
    return schema.organizationInvitations.all().models;
  });

  this.post('/organizations/:id/invitations', () => {
    return {};
  });

  this.post('/organizations/:id/invitations/:inviteId/resend', () => {
    return {};
  });

  this.delete('/organizations/:id/invitations/:inviteId', () => {
    return {};
  });

  this.get('/organizations/:id/me', function (schema) {
    // const currentUser = schema.currentUsers.findBy({
    //   organizationId: req.params.id,
    // });
    // const me = schema.organizationMes.find(currentUser.id);
    // return this.serialize(me).organizationMe;

    return schema.organizationMes.all().models[0]?.toJSON();
  });

  this.put('/v2/am_configurations/:id', () => {
    return {};
  });

  this.get('/v2/am_apps', () => {
    return {};
  });

  this.get('/v2/am_apps/:id', () => {
    return {};
  });

  this.get('/v2/am_apps_syncs/:id', () => {
    return {};
  });

  this.get('/v2/am_apps_versions/:id', () => {
    return {};
  });

  this.get('v2/nf_in_app_notifications', function (schema, request) {
    let data = schema.nfInAppNotifications.all();
    if (request.queryParams.has_read) {
      data = schema.nfInAppNotifications.where({
        hasRead: request.queryParams.has_read == 'true',
      });
    }
    let limit = data.length;
    let offset = 0;
    if (request.queryParams.limit) {
      limit = request.queryParams.limit;
    }
    if (request.queryParams.offset) {
      offset = request.queryParams.offset;
    }

    const retdata = data.slice(offset, offset + limit);

    return {
      count: data.length,
      next: null,
      previous: null,
      results: this.serialize(retdata).nfInAppNotifications,
    };
  });

  this.post('v2/nf_in_app_notifications/mark_all_as_read', function (schema) {
    const notifications = schema.nfInAppNotifications.all();
    notifications.update('hasRead', true);
    return new Response(204, {}, {});
  });

  // DAST Automation Scenario Requests
  this.get('/v2/scan_parameters/:id', (schema, req) =>
    schema.scanParameters.find(req.params.id).toJSON()
  );

  this.get(
    '/v2/scan_parameter_groups/:groupId/scan_parameters/:id',
    (schema, req) => schema.scanParameters.find(req.params.id).toJSON()
  );

  this.get('/v2/scan_parameter_groups/:id', (schema, req) =>
    schema.scanParameterGroups.find(req.params.id).toJSON()
  );

  this.get('/v2/projects/:projectId/scan_parameter_groups/:id', (schema, req) =>
    schema.scanParameterGroups.find(req.params.id).toJSON()
  );

  this.get(
    '/v2/scan_parameter_groups/:groupId/scan_parameters',
    (schema, request) => {
      const data = schema.scanParameters.all();

      let limit = data.length;
      let offset = 0;

      if (request.queryParams.limit) {
        limit = request.queryParams.limit;
      }

      if (request.queryParams.offset) {
        offset = request.queryParams.offset;
      }

      const retdata = data.slice(offset, offset + limit);

      return {
        count: data.length,
        next: null,
        previous: null,
        results: this.serialize(retdata).scanParameters,
      };
    }
  );

  this.get(
    '/v2/projects/:projectId/scan_parameter_groups',
    function (schema, request) {
      const data = schema.scanParameterGroups.all().models;

      let limit = data.length;
      let offset = 0;

      if (request.queryParams.limit) {
        limit = request.queryParams.limit;
      }

      if (request.queryParams.offset) {
        offset = request.queryParams.offset;
      }

      const retdata = data.slice(offset, offset + limit);

      return {
        count: data.length,
        next: null,
        previous: null,
        results: retdata,
      };
    }
  );

  this.post(
    '/v2/projects/:projectId/scan_parameter_groups',
    function (schema, request) {
      const { name, description } = this.normalizedRequestAttrs();

      return schema.scanParameterGroups
        .create({
          name,
          description,
          project: request.params.projectId,
        })
        .toJSON();
    }
  );

  this.put(
    '/v2/projects/:projectId/scan_parameter_groups/:id',
    function (schema, request) {
      const { is_active, ...rest } = this.normalizedRequestAttrs();
      const id = request.params.id;

      return schema.scanParameterGroups
        .find(id)
        .update({ is_active: Boolean(is_active), ...rest });
    }
  );

  this.passthrough();
}
