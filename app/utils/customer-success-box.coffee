customerSuccessBox = ->
  analytics = window.analytics = window.analytics || []
  if !analytics.initialize
    if analytics.invoked
      window.console && console.error && console.error "CustomerSuccess snippet included twice."
  else
    analytics.invoked = !0
    analytics.methods = ["trackSubmit", "trackClick", "trackLink", "trackForm", "pageview", "identify", "reset", "group", "track", "ready", "alias", "debug", "page", "once", "off", "on"]
    analytics.factory = (t)->
      () ->
        Array.prototype.slice.call(arguments);
        e.unshift(t)
        analytics.push(e)
        analytics
    t = 0
    while t < analytics.methods.length
      e = analytics.methods[t]
      analytics[e] = analytics.factory(e)
      t++
    window._csb =
      apiKey: 'HOmdGmRllZJ9Gg76AnzoLKAwXPreHNy5cYh6iEVkZLM='
      apiHost: 'https://appknox.customersuccessbox.com/api_js/v1_1'
    analytics.load = (callback) ->
      script = document.createElement "script"
      script.type = "text/javascript"
      script.async = !0
      script.src = "https://d1h5mit33yhtph.cloudfront.net/analytics.js"
      script.addEventListener 'load', ((e) ->
        if typeof callback == 'function'
          callback e
        return
      ), false
      n = document.getElementsByTagName("script")[0]
      n.parentNode.insertBefore(script, n)
    analytics.load ->

`export default customerSuccessBox`
