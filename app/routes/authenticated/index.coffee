`import Ember from 'ember'`
`import ScrollTopMixin from 'irene/mixins/scroll-top'`
`import RouteTitleMixin from 'irene/mixins/route-title'`

IndexRoute = Ember.Route.extend ScrollTopMixin, RouteTitleMixin,
  subtitle: "Home"
  model: ->
    @modelFor("authenticated")

`export default IndexRoute`
