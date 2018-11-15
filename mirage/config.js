import config from 'irene/config/environment';


export default function() {

  this.passthrough('/write-coverage');
  this.passthrough('https://api.rollbar.com/api/1/item/');
  this.passthrough('https://socket.appknox.com/socket.io/');
  this.passthrough('https://appknox.customersuccessbox.com/api_js/v1_1/page');
  this.passthrough('https://appknox.customersuccessbox.com/api_js/v1_1/track');

  this.namespace = config.host + "/" +  config.namespace;

  this.get('/users/:id', 'user');
  this.get('/users', 'user');
  this.get('/projects/:id', 'project');
  this.get('/projects', 'project');
  this.get('/pricings', 'pricing');
  this.get('/plans', 'plan');
  this.get('/pricings/:id', 'pricing');
  this.get('/teams', 'team');
  this.get('/organizations', 'organization');
  this.get('/teams/:id', 'team');
  this.get('/submissions/:id', 'submission');
  this.get('/submissions', 'submission');
  this.get('/files/:id', 'file');
  this.get('/vulnerabilities/:id', 'vulnerability');
  this.get('/invitations/:id', 'invitation');
  this.get('/devices', 'device');
  this.get('/invoices', 'invoice');
  this.get('/invoices/:id', 'invoice');
  this.get('/attachments/:id', 'attachment');
  this.get('/invitations/', 'invitation');
  this.get('/subscriptions/', 'subscription');
  this.get('/profiles/:id/github_integration');
  this.get('/profiles/:id/jira_integration');
  this.get('/profiles/:id/vulnerability_preferences', 'vulnerability-preference');
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
    return schema.files.findBy({id:FakeRequest.queryParams.projectId});
  });

  this.post('/signup', () => {
    return {user_id: '1', token: 'secret'};
  });

  this.post('/login', () => {
    return {user_id: '1', token: 'secret'};
  });

  this.post('/check', () => {
    return {user_id: '1', token: 'secret'};
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

  this.post('/registration', () => {
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
    return {id: '1'};
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
}
