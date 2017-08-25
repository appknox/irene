import config from 'irene/config/environment';


export default function() {

  this.passthrough('/write-coverage');
  this.passthrough('https://api.rollbar.com/api/1/item/');
  this.passthrough('https://socket.appknox.com/socket.io/');

  this.namespace = config.host + "/" +  config.namespace;

  this.get('/users/:id', 'user');
  this.get('/collaborations/:id', 'collaboration');
  this.get('/collaborations', 'collaboration');
  this.get('/projects/:id', 'project');
  this.get('/projects', 'project');
  this.get('/pricings', 'pricing');
  this.get('/pricings/:id', 'pricing');
  this.get('/teams', 'team');
  this.get('/teams/:id', 'team');
  this.get('/submissions/:id', 'submission');
  this.get('/submissions', 'submission');
  this.get('/files/:id', 'file');
  this.get('/vulnerabilities/:id', 'vulnerability');
  this.get('/invitations/:id', 'invitation');
  this.get('/devices', 'device');
  this.get('/invoices', 'invoice');
  this.get('/invoices/:id', 'invoice');
  this.get('/invitations/', 'invitation');

  this.get('/github_repos', () => {
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

  this.post('/lang', () => {
    return {};
  });

  this.post('/device_preference/:id', () => {
    return {id: '1'};
  });

  this.post('/namespace_add', () => {
    return {};
  });

  this.post('/apply_coupon', () => {
    return {};
  });

  this.post('/stripe_payment', () => {
    return {};
  });

  this.post('/unauthorize_github', () => {
    return {};
  });

  this.post('/unauthorize_jira', () => {
    return {};
  });

  this.delete('/delete_github_repo/:id', () => {
    return {};
  });

  this.delete('/delete_jira_project/:id', () => {
    return {};
  });

  this.post('/api_scan_options/:id', () => {
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

  this.post('/collaborations', () => {
   return;
  });

  this.post('/collaborations/:id', () => {
   return;
  });

  this.post('/teams/:id', () => {
   return;
 });

  this.post('/teams/:id/members', () => {
   return;
  });

  this.delete('/teams/:id/members/Berniece', () => {
   return;
  });

  this.delete('/teams/:id', () => {
   return;
  });

  this.delete('/teams', () => {
   return;
  });

  this.delete('/collaborations/:id', () => {
   return;
  });
}
