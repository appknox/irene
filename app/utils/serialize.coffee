serialize = (obj) ->
  str = []
  for p of obj
    if obj.hasOwnProperty p
      str.push encodeURIComponent(p) + "=" + encodeURIComponent obj[p]
  str.join "&"

`export default serialize`
