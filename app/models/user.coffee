`import DS from 'ember-data'`
`import ENUMS from 'irene/enums'`
`import fromNow from 'ember-moment/computeds/from-now'`
`import momentComputed from 'ember-moment/computeds/moment'`
`import humanize from 'ember-moment/computeds/humanize'`

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
  expiryDateHumanized: humanize 'expiryDate'
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

  expiryText: (->
    currentDate = new Date()
    expiryDate = @get "expiryDate"
    expiryDateHumanized = @get "expiryDateHumanized"
    prefix = "Will expire"
    if currentDate > expiryDate
      prefix = "Expired"
    "#{prefix} on #{expiryDateHumanized}"
  ).property "expiryDate"

`export default User`
