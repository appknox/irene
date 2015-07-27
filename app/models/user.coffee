`import DS from 'ember-data';`
`import { moment, ago } from 'ember-moment/computed';`
`import ENUMS from 'irene/enums'`

User = DS.Model.extend
  username: DS.attr 'string'
  email: DS.attr 'string'
  firstName: DS.attr 'string'
  lastName: DS.attr 'string'
  projects: DS.hasMany 'project', inverse: 'owner', async:false
  scanCount: DS.attr 'number'
  namespaces: DS.attr 'string'
  scansLeft: DS.attr 'number'
  processing: DS.attr 'number'
  pricing: DS.belongsTo 'pricing', inverse: 'users', async:false
  expiryDate: DS.attr 'date'
  hasGithubToken: DS.attr 'boolean'
  socketId: DS.attr 'string'

  humanizedExpiryDate: ago 'expiryDate', true

  urls:null

  statText: (->
    pricingType = @get "pricing.pricingType"
    if pricingType is ENUMS.PRICING.TIME_LIMIT
      "Expiry Date"
    else
      "Scans Left"
  ).property "pricing.pricingType"

  statValue: (->
    pricingType = @get "pricing.pricingType"
    if pricingType is ENUMS.PRICING.TIME_LIMIT
      @get "humanizedExpiryDate"
    else
      @get "scansLeft"
  ).property "scansLeft", "expiryDate"

  statIcon: (->
    pricingType = @get "pricing.pricingType"
    if pricingType is ENUMS.PRICING.TIME_LIMIT
      "calendar"
    else
      "search"
  ).property "pricing.pricingType"

  isProcessing: (->
    processing = @get "processing"
    processing > 0
  ).property "processing"

`export default User;`
