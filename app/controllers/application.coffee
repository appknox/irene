`import Ember from 'ember'`
`import SocketMixin from 'irene/mixins/socket';`
`import ENV from 'irene/config/environment';`

ApplicationController = Ember.Controller.extend SocketMixin,
  currentUser: null

  onboard: Ember.inject.service()

  tourNewScan: (->
    @send "tourNewScan" if 0 is @get "currentUser.scanCount"
  ).observes "currentUser.scanCount"

  tourScanResult: (->
    @send "tourScanResult" if 1 is @get "currentUser.scanCount"
  ).observes "currentUser.scanCount"

  tourScanDetail: (->
    @send "tourScanDetail" if 1 is @get "currentUser.scanCount"
  ).observes "currentUser.scanCount"


  actions:
    tourNewScan: ->
      @set 'onboard.activeTour', ENV.TOUR.newScan

    tourScanResult: ->
      @set 'onboard.activeTour', ENV.TOUR.scanResult

    tourScanDetail: ->
      @set 'onboard.activeTour', ENV.TOUR.scanDetail


`export default ApplicationController`
