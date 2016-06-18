`import DS from 'ember-data';`
`import { moment, ago } from 'ember-moment/computed';`
`import ENUMS from 'irene/enums';`

User = DS.Model.extend
  username: DS.attr 'string'
  email: DS.attr 'string'
  emailMd5: DS.attr 'string'
  firstName: DS.attr 'string'
  lastName: DS.attr 'string'
  ownedProjects: DS.hasMany 'project', inverse: 'owner', async:false
  submissions: DS.hasMany 'submission', inverse: 'user', async:false
  namespaces: DS.attr 'string'
  collaborations: DS.hasMany 'collaboration', inverse: 'user', async: false
  expiryDate: DS.attr 'date'
  hasGithubToken: DS.attr 'boolean'
  hasJiraToken: DS.attr 'boolean'
  socketId: DS.attr 'string'

  humanizedExpiryDate: ago 'expiryDate', true

  urls:null

  gravatarUrl: (->
    "//s.gravatar.com/avatar/#{@get "emailMd5"}?s=100"
  ).property "emailMd5"

  isCurrentUser: (->
    applicationController = @container.lookup "controller:application"
    currentUser = applicationController.get "currentUser"
    currentUser.get("id") is @get "id"
  ).property()

`export default User;`
