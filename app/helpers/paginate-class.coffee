`import Ember from 'ember'`

# This function receives the params `params, hash`
paginateClass = (params) ->

  [offset, page] = params
  if offset is page
    "is-primary"
  else
    "is-default"

PaginateClassHelper = Ember.Helper.helper paginateClass

`export { paginateClass }`

`export default PaginateClassHelper`
