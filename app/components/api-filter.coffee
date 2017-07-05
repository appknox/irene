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

    addNewUrl: ->
      @$('#newInputBox').append('<div><input type="text" class="form-control input margin-top" placeholder="Enter API endpoint"/><i class="fa risk-icons fa-trash-o removeUrl position-icons"></i><br/></div>')
      @$(".removeUrl").click ->
        $(this).parent().remove()

    removeUrl: ->
      event.target.parentElement.remove()

    addApiUrlFilter: (callback) ->
      form = @$('.input')
      debugger
      urls = ""
      that = @
      params = jQuery.makeArray(form)
      params.forEach (param) ->
        url = param.value
        if !hasApiFilter url
          callback(that.get("notify").error "Please enter any url filter")
        if isRegexFailed url
          callback(that.get("notify").error "Please enter a valid url filter")
        if !isAllowedCharacters url
          callback(that.get("notify").error "Special Characters not allowed")
        urls = that.get "urls"
        if Ember.isEmpty urls
          urls = url
        else
          urls = [urls, url].join ','
        that.set "urls", urls
      @set "isApiScanEnabled", true
      if !hasApiFilter urls
        return @get("notify").error "Please enter any url filter"
      project_id = @get "project.id"
      apiScanOptions = [ENV.host,ENV.namespace, ENV.endpoints.apiScanOptions, project_id].join '/'
      data =
        apiUrlFilters: urls
      @get("ajax").post apiScanOptions, data: data
      .then (data)->
        that.set "urls", ""
        that.get("notify").success "Successfully added the url filter"
      .catch (error) ->
        for error in error.errors
          that.get("notify").error error.detail?.message

`export default ApiFilterComponent`
