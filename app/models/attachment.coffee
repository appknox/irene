`import DS from 'ember-data'`

Attachment = DS.Model.extend
  uuid: DS.attr 'string'
  name: DS.attr 'string'
  download_url: DS.attr 'string'

`export default Attachment`
