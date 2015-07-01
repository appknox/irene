`import Ember from 'ember'`

CompareController = Ember.ArrayController.extend
  needs: ['application']
  file1: null
  file2: null

  vulnerabilities: ( ->
    @store.peekAll 'vulnerability'
  ).property()

`export default CompareController`
