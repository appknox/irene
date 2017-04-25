`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`

hasApiFilter = (url)->
  return !Ember.isEmpty url

isRegexFailed = (url) ->
  reg = /http|www/
  res = reg.test(url)

isAllowedCharacters = (url) ->
  reg = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/
  res = reg.test(url)

ApiFilterComponent = Ember.Component.extend

  actions:

    addApiUrlFilter: ->
      apiUrlFilters = @get "project.apiUrlFilters"

      for url in [apiUrlFilters]
        return @get("notify").error "Please enter any url filter" if !hasApiFilter url
        return @get("notify").error "Please enter a valid url filter" if isRegexFailed url
        return @get("notify").error "Special Characters not allowed" if !isAllowedCharacters url

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
