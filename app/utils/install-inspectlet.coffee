`import ENV from 'irene/config/environment'`

installInspectlet = () ->
  if !ENV.enableInspectlet
    return console.log "Inspectlet Disabled"
  do ->
  window.__insp = window.__insp or []
  __insp.push [
    'wid'
    474762302
  ]

  ldinsp = ->
    if typeof window.__inspld != 'undefined'
      return
    window.__inspld = 1
    insp = document.createElement('script')
    insp.type = 'text/javascript'
    insp.async = true
    insp.id = 'inspsync'
    insp.src = (if 'https:' == document.location.protocol then 'https' else 'http') + '://cdn.inspectlet.com/inspectlet.js?wid=474762302&r=' + Math.floor((new Date).getTime() / 3600000)
    x = document.getElementsByTagName('script')[0]
    x.parentNode.insertBefore insp, x
    return

  setTimeout ldinsp, 0
  return

`export default installInspectlet`
