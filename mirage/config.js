export default function() {

  this.get('/users/:userId', (db, request) => {
    return {
      users: db.users.find(request.params.userId)
    };
  });

  this.get('/projects', (db) => {
    return {
      projects: db.projects.all().models
    };
  });

  this.get('/pricings', (db) => {
    return {
      pricings: db.pricings.all().models
    };
  });


  this.get('/files/:fileId', (db, request) => {
    return {
      files: db.files.find(request.params.fileId)
    };
  });

  this.namespace = 'api';

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
