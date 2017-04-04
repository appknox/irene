`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`

ApiFilterComponent = Ember.Component.extend

  actions:
    addApiUrlFilter: ->
      apiUrlFilters = @get "project.apiUrlFilters"
      
      if apiUrlFilters is undefined
        @get("notify").error "Please Enter any url filter"

      project_id = @get "project.id"
      apiScanOptions = [ENV.host,ENV.namespace, ENV.endpoints.apiScanOptions, project_id].join '/'
      that = @
      data =
        apiUrlFilters: apiUrlFilters
      @get("ajax").post apiScanOptions, data: data
      .then (data)->
        that.get("notify").success "Successfully added the url filter"
      .catch (error) ->
        for error in error.errors
          that.get("notify").error error.detail?.message

`export default ApiFilterComponent`
