`import Ember from 'ember';`
`import DjangoAdapter from './django';`

SherlockAdapter = DjangoAdapter.extend
  pathForType: (type) ->
    dasherized = Ember.String.dasherize type
    Ember.String.pluralize dasherized

`export default SherlockAdapter;`
