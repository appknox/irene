`import Ember from 'ember'`
`import SocketMixin from 'irene/mixins/socket';`
`import ENV from 'irene/config/environment';`

ApplicationController = Ember.Controller.extend SocketMixin,
  currentUser: null
  feedback: null
  initLoaded: null

  onboard: Ember.inject.service()

  tourNewScan: (->
    scanCount = @get "currentUser.scanCount"
    currentRouteName = @get "currentRouteName"
    if scanCount is 0 and currentRouteName is "index"
      @send "tourNewScan"
  ).observes "currentUser.scanCount"

  tourScanResult: (->
    scanCount = @get "currentUser.scanCount"
    currentRouteName = @get "currentRouteName"
    if scanCount is 1 and currentRouteName is "index"
      @send "tourScanResult"
  ).observes "currentUser.scanCount"

  tourScanDetail: (->
    scanCount = @get "currentUser.scanCount"
    currentRouteName = @get "currentRouteName"
    if scanCount is 1 and currentRouteName is "file.index"
      @send "tourScanDetail"
  ).observes "currentUser.scanCount"


  actions:
    tourNewScan: ->
      @set 'onboard.activeTour', ENV.TOUR.newScan

    tourScanResult: ->
      @set 'onboard.activeTour', ENV.TOUR.scanResult

    tourScanDetail: ->
      @set 'onboard.activeTour', ENV.TOUR.scanDetail

    tourDashboard: ->
      @set 'onboard.activeTour', ENV.TOUR.dashboard


`export default ApplicationController`
