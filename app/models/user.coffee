`import DS from 'ember-data'`
`import ENUMS from 'irene/enums'`

User = DS.Model.extend

  uuid: DS.attr 'string'
  lang: DS.attr 'string'
  username: DS.attr 'string'
  email: DS.attr 'string'
  firstName: DS.attr 'string'
  lastName: DS.attr 'string'
  ownedProjects: DS.hasMany 'project', inverse:'owner'
  projects: DS.hasMany 'project'
  pricings: DS.hasMany 'pricing'
  submissions: DS.hasMany 'submission', inverse:'user'
  namespaces: DS.attr 'string'
  collaboration: DS.hasMany 'collaboration', inverse:'user'
  expiryDate: DS.attr 'date'
  hasGithubToken: DS.attr 'boolean'
  hasJiraToken: DS.attr 'boolean'
  socketId: DS.attr 'string'
  limitedScans: DS.attr 'boolean'
  scansLeft: DS.attr 'number'

  expiryDateHumanized: Ember.computed "expiryDate", ->
    expiryDate = @get "expiryDate"
    if Ember.isEmpty expiryDate
      return
    "#{expiryDate.toLocaleDateString()}"


`export default User`
