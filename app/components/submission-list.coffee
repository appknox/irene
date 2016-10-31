`import Ember from 'ember'`

SubmissionListComponent = Ember.Component.extend
  classNames:["columns"]
  store: Ember.inject.service()
  submissions:(->
      @get('store').findAll('submission')
  ).property()
`export default SubmissionListComponent`
