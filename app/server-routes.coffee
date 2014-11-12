PROJECTS = [{
    id: 10
    name: "First Project"
  }, {
    id: 42
    name: "Second projects"
  }]

reply = (data, status=200) ->
  [status, {"Content-Type": "application/json"}, JSON.stringify data]


serverRoutes = ->
  @get '/api/projects', (request)->
    reply PROJECTS

  @post '/api-token-auth/', (request) ->
    reply {token: "f3c8e190ad85be8949bc51171db7f64aaf3ffbd3"}

`export default serverRoutes;`
