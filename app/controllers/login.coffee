`import Ember from 'ember'`
`import LoginControllerMixin from 'simple-auth/mixins/login-controller-mixin';`

LoginController = Ember.Controller.extend LoginControllerMixin,
  authenticator: 'authenticator:irene'
  authorizer: 'authorizer:irene'

`export default LoginController`
