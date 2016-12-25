tourName = (name) ->
  
  sessionStorage = JSON.parse(localStorage["ember_simple_auth:session"])
  userId = sessionStorage.authenticated.user_id
  "tour-shown:#{name}-#{userId}"

`export default tourName`
