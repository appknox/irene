`import Ember from 'ember'`
`import { initialize } from 'irene/initializers/auth'`

container = null
application = null

module 'AuthInitializer',
  setup: ->
    Ember.run ->
      container = new Ember.Container()
      application = Ember.Application.create()
      application.deferReadiness()

test 'it works', ->
  initialize container, application
  dict = container.registry.dict
  ok dict["authenticator:irene"], "authenticator is registered!"
  ok dict["authorizer:irene"], "authorizer is registered!"
  ok dict["session:irene"], "session is registered!"
