installHotjar = ->
  ((h, o, t, j, a, r) ->
    h.hj = h.hj or ->
      (h.hj.q = h.hj.q or []).push arguments
      return
    h._hjSettings =
      hjid: 225284
      hjsv: 6
    a = o.getElementsByTagName('head')[0]
    r = o.createElement('script')
    r.async = 1
    r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv
    a.appendChild r
    return
  )(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=')

`export default installHotjar`
