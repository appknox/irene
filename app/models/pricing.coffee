`import DS from 'ember-data'`

Pricing = DS.Model.extend

Pricing = DS.Model.extend {
  name: DS.attr 'string'
  description: DS.attr 'string'
  price: DS.attr 'number'
  manual: DS.attr 'boolean'
}


`export default Pricing`
