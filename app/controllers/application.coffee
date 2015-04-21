`import Ember from 'ember'`
`import SocketMixin from 'irene/mixins/socket';`

ApplicationController = Ember.Controller.extend SocketMixin,
  onboard: Ember.inject.service()

  setupTour: (->
    @set 'onboard.activeTour', 'Basic Tour 1'
  ).on "init"

`export default ApplicationController`
