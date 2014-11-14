`import Ember from 'ember'`
`import LoginControllerMixin from 'simple-auth/mixins/login-controller-mixin';`

LoginController = Ember.Controller.extend LoginControllerMixin,
  authenticator: 'authenticator:foo-rest'
  authorizer: 'authorizer:bar-rest'

`export default LoginController`
