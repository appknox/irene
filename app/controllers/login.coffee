`import Ember from 'ember'`
`import LoginControllerMixin from 'simple-auth/mixins/login-controller-mixin';`
`import AuthenticationControllerMixin from 'simple-auth/mixins/authentication-controller-mixin';`

LoginController = Ember.Controller.extend AuthenticationControllerMixin, LoginControllerMixin,
  authenticator: 'authenticator:django-rest'
  authorizer: 'authorizer:django-rest'

`export default LoginController`
