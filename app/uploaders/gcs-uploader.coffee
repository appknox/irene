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

  read: (file) ->
    new Ember.RSVP.Promise (resolve, reject)->
      reader = new FileReader

      reader.onload = (e) ->
        data = {}
        data.content_type = file.type
        resolve
          result: e.target.result
          data:data

      reader.onerror = ->
        Notify.error "Error occured while trying to read the file"
        reject reject.error
      reader.readAsBinaryString file

  sign: (file) ->
    self = @
    new Ember.RSVP.Promise (resolve, reject) ->

      success = (data) ->
        settings =
          url: self.get 'url'
          type: 'GET'
          contentType: 'json'
          data: data.data

        self._ajax settings
          .then (json)->
            resolve
              json: json
              result: data.result
          , ->
            Notify.error "Server failed to return Signed URL"
            reject()

      self.read file
        .then success

  upload: (file) ->
    self = @

    @set 'isUploading', true

    @sign file
      .then (data) ->
        settings =
          url: "#{data.json.base_url}?#{serialize data.json.query_params}"
          type: "PUT"
          data: data.result
          contentType: false
          processData: false
          xhrFields:
            withCredentials: false
          beforeSend: (xhr)->
            for p of data.json.headers
              if data.json.headers.hasOwnProperty p
                xhr.setRequestHeader p, data.json.headers[p]
        Ember.$.ajax settings
          .then (respData) ->
            Notify.info "Your file finished uploading. Please wait while we process your file."
            self.didUpload respData
            respData
          , (respData)->
            Notify.error "Some Error occured while uploading the file"
      , ->
        Notify.error "Some Error occured while signing the URL"

`export default GCSUploader;`
