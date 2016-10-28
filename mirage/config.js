export default function() {

  this.get('/users/:id', 'user');
  this.get('/collaborations', 'collaboration');
  this.get('/projects', 'project');
  this.get('/projects/:id', 'project');
  this.get('/pricings', 'pricing');
  this.get('/submissions', 'submission');
  this.get('/files', 'file');
  this.get('/files/:id', 'file');
  this.get('/vulnerabilities/:id', 'vulnerability');

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
