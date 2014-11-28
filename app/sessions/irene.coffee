`import Ember from 'ember';`
`import Session from 'simple-auth/session';`

IreneSession = Session.extend

  currentUser: (->
    debugger
    user = @get 'user'
    if !Ember.isEmpty user.id
      @container.lookup('store:main').find 'user', userId
  ).property 'user'

`export default IreneSession;`
