tourName = (name) ->

  userId = "unknown"

  try
    sessionStorage = JSON.parse(localStorage["ember_simple_auth:session"])
    userId = sessionStorage.authenticated.user_id

  "#{name}-#{userId}"

`export default tourName`
