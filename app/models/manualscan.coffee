`import DS from 'ember-data'`

Manualscan = DS.Model.extend
  companyName: DS.attr 'string'
  appName: DS.attr 'string'
  environment: DS.attr 'string'
  osVersion: DS.attr 'string'
  poc: DS.attr()

`export default Manualscan`
