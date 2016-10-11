export default function() {

  this.get('/users/:id', 'user');
  this.get('/collaborations', 'collaboration');
  this.get('/projects', 'project');
  this.get('/projects/:id', 'project');
  this.get('/pricings', 'pricing');
  this.get('/files', 'file');
  this.get('/files/:id', 'files');

  this.namespace = '/api';

  this.post('/login', () => {
    return {user: '1', token: 'secret'};
  });

  this.get('/check', () => {
    return {user: '1', token: 'secret'};
  });

  this.post('/logout', () => {
    return {};
  });

}
