import config from 'irene/config/environment';


export default function() {

  this.namespace = config.host + "/" +  config.namespace;

  this.get('/users/:id', 'user');
  this.get('/collaborations/:id', 'collaboration');
  this.get('/projects/:id', 'project');
  this.get('/pricings', 'pricing');
  this.get('/submissions/:id', 'submission');
  this.get('/files/:id', 'file');
  this.get('/vulnerabilities/:id', 'vulnerability');
  this.get('/invitations/:id', 'invitation');

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

  this.post('/namespace_add', () => {
    return {};
  });

  this.get('/files/', (schema, FakeRequest) => {
    return schema.files.findBy({id:FakeRequest.queryParams.projectId});
  });

}
