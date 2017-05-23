`import Ember from 'ember'`
`import config from 'irene/config/environment';`
`import ScrollTopMixin from 'irene/mixins/scroll-top'`

ReportRoute = Ember.Route.extend ScrollTopMixin,

  title: "Report"  + config.platform
  model: (params)->
    @get('store').find('report', params.reportId)

`export default ReportRoute`
