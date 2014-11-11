`import Ember from 'ember'`
`import LoginControllerMixin from 'simple-auth/mixins/login-controller-mixin';`

LoginController = Ember.Controller.extend LoginControllerMixin,
  authenticator: 'authenticator:django-rest'
  authorizer: 'authorizer:django-rest'

`export default LoginController`
