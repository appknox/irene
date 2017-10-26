`import Ember from 'ember';`
`import ENV from 'irene/config/environment';`

Router = Ember.Router.extend
  location: ENV.locationType
  rootURL: ENV.rootURL

Router.map ->
  @route 'freestyle'
  @route 'login'
  @route 'recover'
  @route 'reset', path: '/reset/:uuid/:token'
  @route 'authenticated', path: '/', ->
    @route "index", path: '/'
    @route "teams", path: '/teams'
    @route "team", path: '/team/:teamId'
    @route "settings", path: '/settings'
    @route "billing", path: '/billing'
    @route 'payment', path:'/payment/:pricingId/:paymentDuration'
    @route 'invoice', path:'/invoice/:invoiceId'
    @route "project", path: '/project/:projectId', ->
      @route 'settings'
      @route 'files'
    @route "file", path: '/file/:fileId'
    @route "choose",path: '/choose/:fileId'
    @route 'compare', path: '/compare/:files'
    @route 'payment-success'
    @route 'payment-failure'
  @route 'invitation', path: '/invitation/:uuid'

  # 404 path -this should be at the last.
  @route 'not-found', path: '/*path'

Router.reopen
  checkForAppcues: (->
     Ember.run.scheduleOnce 'afterRender', ->
         Appcues.start()
  ).on 'didTransition'

CSBMap = {
  "authenticated.settings":{
    feature: "Account Settings",
    module: "Setup"
  },
  "authenticated.project.files":{
    feature: "All Scans",
    module: "Security"
  },
  "authenticated.choose":{
    feature: "Compare Scans",
    module: "Security"
  }
}

`export { Router as default, CSBMap as CSBMap}`
