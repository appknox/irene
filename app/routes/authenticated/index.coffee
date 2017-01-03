`import Ember from 'ember'`
`import config from 'irene/config/environment';`
`import ENV from 'irene/config/environment'`
`import ScrollTopMixin from 'irene/mixins/scroll-top'`

IndexRoute = Ember.Route.extend ScrollTopMixin,
  title: "Home" + config.platform
  model: ->
    @modelFor("authenticated")

`export default IndexRoute`
