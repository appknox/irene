`import Ember from 'ember'`
`import RouteTitleMixin from 'irene/mixins/route-title'`

InvitationRoute = Ember.Route.extend RouteTitleMixin,

  subtitle: "Invitation"

  model: (params)->
    @store.findRecord "invitation", params.uuid

`export default InvitationRoute`
