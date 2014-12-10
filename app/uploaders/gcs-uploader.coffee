`import Ember from 'ember';`
`import Notify from 'ember-notify';`

serialize = (obj) ->
  str = []
  for p of obj
    if obj.hasOwnProperty p
      str.push encodeURIComponent(p) + "=" + encodeURIComponent obj[p]
  str.join "&"

GCSUploader = Ember.Uploader.extend
  ###
  #  Url used to request a signed upload url
  #  @property url
  ###

  url: null

  sign: (file) ->
    self = @
    new Ember.RSVP.Promise (resolve, reject) ->
      settings =
        url: self.get 'url'
        type: 'GET'
        contentType: 'json'
        data:
          content_type: file.type

      self._ajax settings
        .then (json)->
          resolve json
        , ->
          Notify.error "Server failed to return Signed URL"
          reject()


  upload: (file) ->
    self = @

    @set 'isUploading', true

    @sign file
      .then (json) ->
        settings =
          url: "#{json.base_url}?#{serialize json.query_params}"
          type: "PUT"
          data: "bloop"
          contentType: false
          processData: false
          xhrFields:
            withCredentials: false
          beforeSend: (xhr)->
            for p of json.headers
              if json.headers.hasOwnProperty p
                xhr.setRequestHeader p, json.headers[p]
        Ember.$.ajax settings
          .then (respData) ->
            Notify.info "Your file finished uploading. Please wait while we process your file."
            self.didUpload respData
            respData
          , (respData)->
            Notify.error "Some Error occured while uploading the file"

      , ->
        debugger
`export default GCSUploader;`
