`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`
`import { translationMacro as t } from 'ember-i18n'`

isRegexFailed = (url) ->
  reg = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/
  res = reg.test(url)

ApiFilterComponent = Ember.Component.extend
  project: null
  deletedURL: ""
  i18n: Ember.inject.service()

  tEmptyURL: t("emptyURL")
  tInvalidURL: t("invalidURL")
  tURLAdded: t("urlAdded")
  isSavingFilter: false

  showButton: false


  confirmCallback: ->
    deletedURL = @get "deletedURL"
    urlCount = deletedURL.parentElement.childElementCount
    if urlCount is 1
      deletedURL.firstChild.value = ""
    else
      deletedURL.remove()
    @set "showRemoveURLConfirmBox", false

  actions:

    addNewUrl: ->
      apiUrlFilters = @get "project.apiUrlFilters"
      @set "project.apiUrlFilters", apiUrlFilters.concat(",")

    addApiUrlFilter: (callback) ->
      allFilters = @$('.input')
      urls = ""
      uniqueArrays = ""
      tEmptyURL = @get "tEmptyURL"
      tInvalidURL = @get "tInvalidURL"
      tURLAdded = @get "tURLAdded"
      filterArray = Ember.ArrayProxy.create content: Ember.A allFilters
      that = @
      filterArray.forEach (filter) ->
        url = filter.value
        for url in [url]
          if !Ember.isEmpty url
            return callback(that.get("notify").error "#{url} #{tInvalidURL}") if !isRegexFailed url
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
      urlString = urlString.replace(/,\s*$/, "")
      apiScanOptions = [ENV.host,ENV.namespace, ENV.endpoints.apiScanOptions, project_id].join '/'
      data =
        apiUrlFilters: urlString
      analytics.feature(ENV.csb.feature.addAPIEndpoints, ENV.csb.module.security, ENV.csb.product.appknox)
      @set "isSavingFilter", true
      @get("ajax").post apiScanOptions, data: data
      .then (data)->
        that.set "isSavingFilter", false
        that.get("notify").success tURLAdded
      .catch (error) ->
        that.set "isSavingFilter", false
        for error in error.errors
          that.get("notify").error error.detail?.message

    openRemoveURLConfirmBox: ->
      @set "deletedURL", event.target.parentElement
      @set "showRemoveURLConfirmBox", true

    closeRemoveURLConfirmBox: ->
      @set "showRemoveURLConfirmBox", false




`export default ApiFilterComponent`
