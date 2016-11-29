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
  collaborations: DS.hasMany 'collaboration', inverse:'user'
  expiryDate: DS.attr 'date'
  hasGithubToken: DS.attr 'boolean'
  hasJiraToken: DS.attr 'boolean'
  socketId: DS.attr 'string'
  limitedScans: DS.attr 'boolean'
  scansLeft: DS.attr 'number'
  githubRedirectUrl: DS.attr 'string'

  sortProperties: ["lastFileCreatedOn:desc"]
  sortedProjects: Ember.computed.sort 'projects', 'sortProperties'

  projectCount: Ember.computed.alias 'projects.length'
  hasProjects: Ember.computed.gt 'projectCount', 0

  currentDate: new Date()
  hasExpired: (->
    currentDate = @get "currentDate"
    expiryDate = @get "expiryDate"
    if currentDate > expiryDate
      "Expired"
    ).property "expiryDate"
`export default User`
