`import Ember from 'ember'`

ChooseRoute = Ember.Route.extend

  model: (params)->
    @store.find 'file', params.file_id

  afterModel: (file, transition) ->
    file.get("project").reload()

`export default ChooseRoute`
