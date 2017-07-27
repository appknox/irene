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
  teams: DS.hasMany 'team', inverse: 'users'
  ownedTeams: DS.hasMany 'team', inverse: 'owner'
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
  billingHidden: DS.attr 'boolean'
  mfaMethod: DS.attr 'number'
  mfaSecret: DS.attr 'string'

  provisioningURL: (->
    mfaSecret = @get "mfaSecret"
    email = @get "email"
    "otpauth://totp/Appknox:#{email}?secret=#{mfaSecret}&issuer=Appknox"
  ).property "mfaSecret", "email"

  mfaEnabled: (->
    mfaMethod = @get "mfaMethod"
    if mfaMethod is ENUMS.MFA_METHOD.TOTP
      return true
    false
  ).property "mfaMethod"

  totalProjects: (->
    projectCount = @get "projectCount"
    if projectCount is 0
      return "no project"
    else if projectCount is 1
      return "#{projectCount} project"
    "#{projectCount} projects"
  ).property "projectCount"

  ifBillingIsNotHidden: (->
    billingHidden = @get 'billingHidden'
    !billingHidden
  ).property 'billingHidden'

  getExpiryDate: (->
    if ENV.isAppknox
      expiryDate = @get "expiryDate"
    else
      expiryDate = @get "devknoxExpiry"
  ).property "expiryDate"

  hasExpiryDate: (->
    getExpiryDate = @get "getExpiryDate"
    if Ember.isEmpty getExpiryDate
      false
    else
      true
  ).property "getExpiryDate"

  expiryText: (->
    currentDate = new Date()
    expiryDate = @get "expiryDate"
    prefix = "subscriptionWillExpire"
    if currentDate > expiryDate
      prefix = "subscriptionExpired"
    prefix
  ).property "expiryDate"

  namespaceItems:(->
    namespaces = @get "namespaces"
    namespaces?.split ","
  ).property "namespaces"

  namespacesCount: Ember.computed.alias 'namespaces.length'

  hasNamespace: Ember.computed.gt 'namespacesCount', 0

`export default User`
