`import DS from 'ember-data'`
`import ENUMS from 'irene/enums'`

User = DS.Model.extend
  username: DS.attr 'string'
  email: DS.attr 'string'
  emailmd5: DS.attr 'string'
  firstName: DS.attr 'string'
  lastName: DS.attr 'string'
  ownedProjects: DS.hasMany 'project', inverse:'owner'
  submissions: DS.hasMany 'submission', inverse:'user'
  namespaces: DS.attr 'string'
  collaboration: DS.hasMany 'collaboration', inverse:'user'
  expiryDate: DS.attr 'date'
  hasGithubToken: DS.attr 'boolean'
  hasJiraToken: DS.attr 'boolean'
  socketId: DS.attr 'string'
  limitedScans: DS.attr()
  scansLeft: DS.attr()


`export default User`
