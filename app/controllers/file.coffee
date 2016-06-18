`import Ember from 'ember'`
`import EmberCLIICAjax from 'ic-ajax';`
`import ENV from 'irene/config/environment';`
`import Notify from 'ember-notify';`


FileController = Ember.Controller.extend

  needs: ['application']

  sortedAnalysis: (->
    analyses = @get "model.analyses"
    analyses.sortBy('risk').reverse()
  ).property "model.analyses.@each.risk"

  actions:

    getPDFReportLink: ->
      file_id = @get "model.id"
      ###
      Pricing logic
      pricing = @get "model.project.owner.pricing"
      if Ember.isEmpty pricing
        return @get("controllers.application.upgradePlanModal").send "showModal"
      ###
      signedUrl = [ENV.APP.API_BASE, ENV.endpoints.signedPdfUrl, file_id].join '/'
      xhr = EmberCLIICAjax url:signedUrl, type: "get"
      xhr.then (result) ->
        window.location = result.url

    requestManual: ->
      if !@get "model.isOkToRequestManual"
        return @get("controllers.application.upgradePlanModal").send "showModal"
      file_id = @get "model.id"
      manualUrl = [ENV.APP.API_BASE, ENV.endpoints.manual, file_id].join '/'
      xhr = EmberCLIICAjax url:manualUrl, type: "get"
      resolve = (result) ->
        Notify.info "Manual assessment requested."
      reject = (result)->
        Notify.error "Something went wrong."
      xhr.then resolve, reject

    tourScanDetail: ->
      @set 'controllers.application.onboard.activeTour', ENV.TOUR.scanDetail

`export default FileController`
