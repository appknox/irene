import Route from '@ember/routing/route';

export default Route.extend({
  title: 'Registration',
  model(params) {
    return {
      'token': params.token
    };
  }
});
