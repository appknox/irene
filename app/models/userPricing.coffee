`import DS from 'ember-data'`

UserPricing = DS.Model.extend {
  uuid: DS.attr 'string'
  description: DS.attr 'string'
  expiry_date: DS.attr 'date'
  limited_scans: DS.attr 'boolean'
  scans_left: DS.attr 'number'
  duration: DS.attr 'number'
}


`export default UserPricing`
