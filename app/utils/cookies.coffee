cookieUtil =
  deleteAllCookies: ->
    for cookie in document.cookie.split ";"
      eqPos = cookie.indexOf "="
      name = if eqPos > -1 then cookie.substr(0, eqPos) else cookie
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT"

`export default cookieUtil`
