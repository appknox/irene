import config from 'irene/config/environment';

import { createServer, discoverEmberDataModels } from 'ember-cli-mirage';

export function makeServer(config) {
  let finalConfig = {
    ...config,
    models: {
      ...discoverEmberDataModels(),
      ...config.models,
    },
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
    return schema.partnerClients.findBy({
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

  this.namespace = config.namespace;

  this.get('/api/organizations/:id/projects', (schema) => {
    return schema.projects.all().models;
  });
  this.get(
    '/api/profiles/:id/unknown_analysis_status',
    'unknown-analysis-status'
  );
  this.get('/users/:id', 'user');
  this.get('/users', 'user');
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
    return schema.vulnerabilities.all().models;
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
    return schema.files.findBy({
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

  this.get('/organizations/:orgId/members/:memId', (schema, request) => {
    return schema.organizationMembers.find(request.params.memId);
  });

  this.get('/organizations/:id/me', (schema, req) => {
    return schema.organizationMes.find(req.params.id);
  });
  this.passthrough();
}
