`import DS from 'ember-data'`
`import {moment, ago} from 'ember-moment/computed'`
`import ENUMS from 'irene/enums'`

User = DS.Model.extend
  username: DS.attr 'string'
  email: DS.attr 'string'
  emailmd5: DS.attr 'string'
  firstName: DS.attr 'string'
  lastName: DS.attr 'string'
  ownedProject: DS.hasMany 'project', inverse:'owner', async:false
  submissions: DS.hasMany 'submissions', inverse:'user', async:false
  namespaces: DS.attr 'string'
  colloborations: DS.hasMany 'colloboration', inverse:'user', async:false
  expiryDate: DS.attr 'date'
  hasGithubToken: DS.attr 'boolean'
  hasJiraToken: DS.attr 'boolean'
  socketId: DS.attr 'string'
  limitedScans: DS.attr()
  scansLeft: DS.attr()

  humanizedExpiryDate : ago 'expiryDate', true

  urls:null

  gravatarUrl:( ->
    "//s.gravatar.com/avatar/#{@get "emailmd5"}?s=50"
  ).property "emailmd5"

  isCurrentUser:( ->
    applicationController = @container.lookup "controller:application"
    currentUser = applicationController.get "currentUser"
    currentUser.get("id") is @get "id"
  ).property()

  statText: ( ->
    limitedScans = @get "limitedScans"
    if limitedScans
      "Scans Left"
    else
      "Expiry Date"
  ).property "limitedScans"

  statValue:( ->
    limitedScans = @get "limitedScans"
    if limitedScans
      @get "scansLeft"
    else
      @get "humanizedExpiryDate"
  ).property "limitedScans"

  statIcon:( ->
    limitedScans = @get "limitedScans"
    if limitedScans
      "search"
    else
      "calender"  
  ).property "limitedScans"

`export default User`
