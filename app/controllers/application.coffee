`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`

ApplicationController = Ember.Controller.extend
  currentUser: null
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

  collaborationForUserAndProject: (project, user) ->
    collaborations = project.get "collaborations"
    return if Ember.isEmpty collaborations
    count = collaborations.length
    while count > 0
      count -= 1
      collaboration = collaborations.objectAt count
      collaborationUserId = collaboration.get "user.id"
      givenUserId = user.get "id"
      return collaboration if collaborationUserId is givenUserId

  collaborationForProject: (project) ->
    @collaborationForUserAndProject project, @get "currentUser"

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
