`import ApplicationRouteMixin from 'simple-auth/mixins/application-route-mixin';`
`import Ember from 'ember';`
`import EmberCLIICAjax from 'ic-ajax';`
`import ENV from 'irene/config/environment';`

ApplicationRoute = Ember.Route.extend ApplicationRouteMixin,

  fetchData: ->
    store = @store
    initUrl = [ENV.APP.API_BASE, ENV.endpoints.init].join '/'
    controller = @controller
    new Ember.RSVP.Promise (resolve, reject) ->
      init = EmberCLIICAjax url:initUrl, type: "get"
      init.then (result) ->
        for vulnerability in result.vulnerabilities
          store.pushPayload 'vulnerability', vulnerability: vulnerability
        for user in result.users
          store.pushPayload 'user', user: user
        for project in result.projects
          store.pushPayload 'project', project: project
        for collaboration in result.collaborations
          store.pushPayload 'collaboration', collaboration: collaboration
        for file in result.files
          store.pushPayload 'file', file: file
        for analysis in result.analyses
          store.pushPayload 'analysis', analysis: analysis
        for pricing in result.pricings
          store.pushPayload 'pricing', pricing: pricing
        store.pushPayload 'ratio', ratio: result.ratio
        user = store.pushPayload 'user', user: result.currentUser
        store.find('user', result.currentUser.id).then (user)->
          user.set 'urls', result.urls
          controller.set 'currentUser', user
          controller.subscribe user.get "socketId"
          Raven.setUserContext
            email: user.get "email"
            id: user.get "id"
          Raven.captureMessage "User Logged in", level: "info"
        controller.set 'initLoaded', true
        resolve result

  setupController: (controller)->
    if !Ember.isEmpty localStorage.authToken
      @fetchData()

  actions:

    sessionAuthenticationSucceeded: ->
      @_super()
      @fetchData()

`export default ApplicationRoute;`
