PROJECTS = [{
    id: 10
    name: "First Project"
  }, {
    id: 42
    name: "Second projects"
}]

USER =
  id: 1
  uuid: "df8a42f0-6bd9-11e4-90da-14109fe45927"
  username: 'dhilipsiva'
  email: 'dhilipsiva@gmail.com'
  first_name: 'dhilipsiva'
  last_name: 'Dhilip'

reply = (data, status=200) ->
  [status, "Content-Type": "application/json", JSON.stringify data]

serverRoutes = ->
  @get '/projects/', (request)->
    reply projects: PROJECTS

  @post '/token/', (request) ->
    reply token: "f3c8e190ad85be8949bc51171db7f64aaf3ffbd3", user: USER


`export default serverRoutes;`
