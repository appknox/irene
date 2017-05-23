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
  this.get('/submissions/:id', 'submission');
  this.get('/submissions', 'submission');
  this.get('/files/:id', 'file');
  this.get('/vulnerabilities/:id', 'vulnerability');
  this.get('/invitations/:id', 'invitation');
  this.get('/devices', 'device');
  this.get('/reports/:id', 'report');
  this.get('/invoices', 'invoice');
  this.get('/invoices/:id ', 'invoice');

  this.get('/github_repos', () => {
    return {};
  });

  this.get('/dynamic/:id', () => {
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

  this.post('/delete_github_repo/:id', () => {
    return {};
  });

  this.post('/delete_jira_project/:id', () => {
    return {};
  });

  this.post('/api_scan_options/:id', () => {
    return {};
  });

}
