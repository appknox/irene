installPendo = ->
  ((apiKey) ->
    ((p, e, n, d, o) ->
      v = undefined
      w = undefined
      x = undefined
      y = undefined
      z = undefined
      o = p[d] = p[d] or {}
      o._q = []
      v = [
        'initialize'
        'identify'
        'updateOptions'
        'pageLoad'
      ]
      w = 0
      x = v.length
      while w < x
        ((m) ->
          o[m] = o[m] or ->
            o._q[if m == v[0] then 'unshift' else 'push'] [ m ].concat([].slice.call(arguments, 0))
            return
          return
        ) v[w]
        ++w
      y = e.createElement(n)
      y.async = !0
      y.src = 'https://cdn.pendo.io/agent/static/' + apiKey + '/pendo.js'
      z = e.getElementsByTagName(n)[0]
      z.parentNode.insertBefore y, z
      return
    ) window, document, 'script', 'pendo'
    return
  ) 'f0a11665-8469-4c41-419f-b9f400b01f08'

`export default installPendo`
