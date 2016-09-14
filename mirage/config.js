export default function() {

  this.namespace = 'api';

  this.post('/login', (schema, request) => {
    return {user: '1', token: 'secret'};
  });

  this.get('/check', (schema, request) => {
    return {user: '1', token: 'secret'};
  });

  this.post('/logout', (schema, request) => {
    return {};
  });

}
