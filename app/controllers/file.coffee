`import Ember from 'ember'`
`import EmberCLIICAjax from 'ic-ajax';`
`import serialize from 'irene/utils/serialize';`
`import ENV from 'irene/config/environment';`
`import Notify from 'ember-notify';`


FileController = Ember.ObjectController.extend

  sortedAnalysis: (->
    analyses = @get "model.analyses"
    analyses.sortBy('risk').reverse()
  ).property "model.analyses.@each.risk"

  actions:

    getPDFReportLink: ->
      file_id = @get "model.id"
      signedUrl = [ENV.APP.API_BASE, ENV.endpoints.signedPdfUrl, file_id].join '/'
      xhr = EmberCLIICAjax url:signedUrl, type: "get"
      xhr.then (result) ->
        window.location = result.base_url

    requestManual: ->
      if !@get "model.isOkToRequestManual"
        return Notify.error "Please susbcribe to a standard / custom plan to avail this feature"
      file_id = @get "model.id"
      manualUrl = [ENV.APP.API_BASE, ENV.endpoints.manual, file_id].join '/'
      xhr = EmberCLIICAjax url:manualUrl, type: "get"
      resolve = (result) ->
        Notify.info "Manual assessment requested."
      reject = (result)->
        debugger
        Notify.error "Something went wrong."
      xhr.then resolve, reject

`export default FileController`
