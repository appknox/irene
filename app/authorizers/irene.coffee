`import Base from 'simple-auth/authorizers/base';`

IreneAuthorizer = Base.extend
  authorize: (jqXHR, requestOptions) ->
    token = @get 'session.token'
    isAuthenticated = @get 'session.isAuthenticated'
    if isAuthenticated && !Ember.isEmpty token
      jqXHR.setRequestHeader 'Authorization', "Token #{token}"

`export default IreneAuthorizer`
