`import DS from 'ember-data'`
`import ENUMS from 'irene/enums'`
`import ENV from 'irene/config/environment';`

User = DS.Model.extend

  uuid: DS.attr 'string'
  invoices: DS.hasMany 'invoice', inverse:'user'
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
  devknoxExpiry: DS.attr 'date'
  projectCount: DS.attr 'number'
  hasGithubToken: DS.attr 'boolean'
  hasJiraToken: DS.attr 'boolean'
  socketId: DS.attr 'string'
  limitedScans: DS.attr 'boolean'
  scansLeft: DS.attr 'number'
  githubRedirectUrl: DS.attr 'string'

  expiryText: (->
    currentDate = new Date()
    if ENV.isAppknox
      expiryDate = @get "expiryDate"
    else
      expiryDate = @get "devknoxExpiry"
    if Ember.isEmpty expiryDate
      return "Expired"
    prefix = "Will expire"
    if currentDate > expiryDate
      prefix = "Expired"
    "#{prefix} on #{expiryDate.toLocaleDateString()}"
  ).property "expiryDate"




`export default User`
