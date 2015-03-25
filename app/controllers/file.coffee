`import Ember from 'ember'`
`import EmberCLIICAjax from 'ic-ajax';`
`import serialize from 'irene/utils/serialize';`
`import ENV from 'irene/config/environment';`


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

`export default FileController`
