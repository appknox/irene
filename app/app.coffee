`import Ember from 'ember';`
`import Resolver from 'ember/resolver';`
`import loadInitializers from 'ember/load-initializers';`
`import ENV from 'irene/config/environment';`
`import Notify from 'ember-notify';`

if ENV.environment is "production"
  # Raven - Ember Plugin
  _oldOnError = Ember.onerror

  Ember.onerror  = (error) ->
    Raven.captureException error
    if 'function' is typeof _oldOnError
      _oldOnError.call @, error

  _notifyShow = Notify.show

  Notify.show = (type, message, options) ->
    _notifyShow.call @, type, message, options
    Raven.captureMessage message if type is "error"

  Ember.RSVP.on 'error', (err) ->
    Raven.captureException err

  Ember.RSVP.on 'fulfilled', ->
    Raven.captureMessage "RSVP Fulfilled!", {"level": "info"}

  Ember.RSVP.on 'rejected', ->
    Raven.captureMessage "RSVP Rejected!", {"level": "info"}

  rvn = Raven.config ENV.ravenDSN,
    release: ENV.currentRevision

  rvn.install()
else
  window.Raven =
    setUserContext: ->
      console.log "Raven.setUserContext"
      console.log arguments

    captureMessage: ->
      console.log "Raven.captureMessage"
      console.log arguments

    captureException: (exception)->
      # debugger
      console.log "Raven.captureException"
      console.error exception.stack

    config: ->
      console.log "Raven.config"
      console.log arguments

      install: ->
        console.log "Raven.install"
        console.log arguments

Ember.$.ajaxSetup
  type: "POST"
  data: {}
  dataType: 'json'
  xhrFields:
    withCredentials: true
  crossDomain: true

Ember.MODEL_FACTORY_INJECTIONS = true

App = Ember.Application.extend
  modulePrefix: ENV.modulePrefix
  podModulePrefix: ENV.podModulePrefix
  Resolver: Resolver
  Socket: EmberSockets.extend
    host: ENV.socketHost
    port: ENV.socketPort
    secure: ENV.socketSecure
    controllers: ['application']
    autoConnect: true

loadInitializers App, ENV.modulePrefix

# Ember script

if ENV.environment is "production"
  `window.zEmbed||function(e,t){var n,o,d,i,s,a=[],r=document.createElement("iframe");window.zEmbed=function(){a.push(arguments)},window.zE=window.zE||window.zEmbed,r.src="javascript:false",r.title="",r.role="presentation",(r.frameElement||r).style.cssText="display: none",d=document.getElementsByTagName("script"),d=d[d.length-1],d.parentNode.insertBefore(r,d),i=r.contentWindow,s=i.document;try{o=s}catch(c){n=document.domain,r.src='javascript:var d=document.open();d.domain="'+n+'";void(0);',o=s}o.open()._l=function(){var o=this.createElement("script");n&&(this.domain=n),o.id="js-iframe-async",o.src=e,this.t=+new Date,this.zendeskHost=t,this.zEQueue=a,this.body.appendChild(o)},o.write('<body onload="document._l();">'),o.close()}("//assets.zendesk.com/embeddable_framework/main.js","appknox.zendesk.com");`

  `window.heap=window.heap||[],heap.load=function(e,t){window.heap.appid=e,window.heap.config=t=t||{};var n=t.forceSSL||"https:"===document.location.protocol,a=document.createElement("script");a.type="text/javascript",a.async=!0,a.src=(n?"https:":"http:")+"//cdn.heapanalytics.com/js/heap-"+e+".js";var o=document.getElementsByTagName("script")[0];o.parentNode.insertBefore(a,o);for(var r=function(e){return function(){heap.push([e].concat(Array.prototype.slice.call(arguments,0)))}},p=["clearEventProperties","identify","setEventProperties","track","unsetEventProperty"],c=0;c<p.length;c++)heap[p[c]]=r(p[c])}; heap.load("3021997377");`


`export default App;`
