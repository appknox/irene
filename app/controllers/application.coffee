`import Ember from 'ember'`
`import SocketMixin from 'irene/mixins/socket';`
`import ENV from 'irene/config/environment';`

ApplicationController = Ember.Controller.extend SocketMixin,
  onboard: Ember.inject.service()

  setupTour: (->
    @set 'onboard.activeTour', ENV.ONBOARD.scanApp
  ).on "init"

`export default ApplicationController`
