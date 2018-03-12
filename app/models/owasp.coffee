`import DS from 'ember-data'`

Owasp = DS.Model.extend
  code: DS.attr()
  title: DS.attr()
  description: DS.attr()
  year: DS.attr 'number'

`export default Owasp`
