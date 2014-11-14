`import Ember from 'ember';`
`import Session from 'simple-auth/session';`

IreneSession = Session.extend
  user: (->
    userId = @get 'user_id'
    if !Ember.isEmpty userId
      @container.lookup('store:main').find 'user', userId
  ).property 'user_id'

`export default IreneSession;`
