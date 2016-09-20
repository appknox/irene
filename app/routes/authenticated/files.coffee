`import Ember from 'ember'`

AuthenticatedFilesRoute = Ember.Route.extend

    model: ()->
      @get('store').findAll('file')

`export default AuthenticatedFilesRoute`
