`import Ember from 'ember'`
`import EmberCLIICAjax from 'ic-ajax';`
`import serialize from '../utils/serialize';`


FileController = Ember.ObjectController.extend

  sortedAnalysis: (->
    analyses = @get "model.analyses"
    analyses.sortBy('risk').reverse()
  ).property "model.analyses.@each.risk"

  actions:

    getPDFReportLink: ->
      file_id = @get "model.id"
      applicationAdapter = @store.adapterFor 'application'
      host = applicationAdapter.get 'host'
      namespace = applicationAdapter.get 'namespace'
      signedUrl = [host, namespace, 'signed_pdf_url', file_id].join '/'
      xhr = EmberCLIICAjax url:signedUrl, type: "get"
      xhr.then (result) ->
        window.location = "#{result.base_url}?#{serialize result.query_params}&response-content-disposition=attachment%3B%20filename%3D#{file_id}.pdf"

`export default FileController`
