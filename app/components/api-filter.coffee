`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`

hasApiFilter = (url)->
  return !Ember.isEmpty url

isRegexFailed = (url) ->
  reg = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/
  res = reg.test(url)

ApiFilterComponent = Ember.Component.extend
  project: null
  actions:

    addNewUrl: ->
      @project.addNewAPIURL()

    removeUrl: (item) ->
      @project.removeUrl()

    addApiUrlFilter: (callback) ->
      allFilters = @$('.input')
      urls = ""
      uniqueArrays = ""
      filterArray = Ember.ArrayProxy.create content: Ember.A allFilters
      that = @
      filterArray.forEach (filter) ->
        url = filter.value
        for url in [url]
          return callback(that.get("notify").error "Please enter any url filter") if !hasApiFilter url
          return callback(that.get("notify").error " '#{url}' is an invalid url") if !isRegexFailed url
        urls = that.get "urls"
        if Ember.isEmpty urls
          urls = url
        else
          urls = [urls, url].join ','
        that.set "urls", urls
      project_id = @get "project.id"
      splittedArray = urls?.split ","
      uniqueArrays = splittedArray.uniq()
      urlString = uniqueArrays.join ','
      apiScanOptions = [ENV.host,ENV.namespace, ENV.endpoints.apiScanOptions, project_id].join '/'
      data =
        apiUrlFilters: urlString
      @get("ajax").post apiScanOptions, data: data
      .then (data)->
        that.get("notify").success "Successfully added the url filter"
      .catch (error) ->
        for error in error.errors
          that.get("notify").error error.detail?.message



`export default ApiFilterComponent`
