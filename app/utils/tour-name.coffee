tourName = (name) ->
  sessionStorage = JSON.parse(localStorage["ember_simple_auth:session"])
  userId = sessionStorage.authenticated.user_id
  "Already Shown: #{name}" + userId

`export default tourName`
