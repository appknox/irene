`import DS from 'ember-data'`

Pricing = DS.Model.extend
  name: DS.attr 'string'
  heading: DS.attr 'string'
  sast: DS.attr 'string'
  dast: DS.attr 'string'
  uba: DS.attr 'string'
  remedition: DS.attr 'string'
  sla: DS.attr 'string'
  scans: DS.attr 'string'
  description: DS.attr 'string'
  price: DS.attr 'number'

`export default Pricing`
