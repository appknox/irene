installIntercom = ->
  w = window
  ic = w.Intercom

  l = ->
    s = d.createElement('script')
    s.type = 'text/javascript'
    s.async = true
    s.src = 'https://widget.intercom.io/widget/mbkqc0o1'
    x = d.getElementsByTagName('script')[0]
    x.parentNode.insertBefore s, x

  if `typeof ic == 'function'`
    ic 'reattach_activator'
    ic 'update', intercomSettings
  else
    d = document

    i = ->
      i.c arguments

    i.q = []

    i.c = (args) ->
      i.q.push args
      return

    w.Intercom = i
    if w.attachEvent
      w.attachEvent 'onload', l
    else
      w.addEventListener 'load', l, false

`export default installIntercom`

