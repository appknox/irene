`import Ember from 'ember';`

IndexController = Ember.ArrayController.extend

  model:( ->
    @store.all 'project'
  ).property()

`export default IndexController;`
