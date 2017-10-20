`import Ember from 'ember'`
`import ScrollTopMixin from 'irene/mixins/scroll-top'`

IndexRoute = Ember.Route.extend ScrollTopMixin,
  title: "Home"
  model: ->
    @modelFor("authenticated")

`export default IndexRoute`
