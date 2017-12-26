`import Ember from 'ember'`

ChartComponentComponent = Ember.Component.extend

  stat: (->
    @get('store').find 'stat', 1
  ).property()

  chartOptions: (->
    scales: { yAxes: [{ ticks: { beginAtZero:true, stepSize: 1 } }]}
    legend: { display: false }
  ).property()

  barData: (->
    stat = @get "stat"
    totalCritical = @get("stat.totalCritical")
    totalHigh = @get("stat.totalHigh")
    totalMedium = @get("stat.totalMedium")
    totalLow = @get("stat.totalLow")
    labels: [
      'CRITICAL'
      'HIGH'
      'MEDIUM'
      'LOW'
    ]
    datasets: [ {
      data: [
        totalCritical
        totalHigh
        totalMedium
        totalLow
      ]
      backgroundColor: [
        "#EF4836"
        "#FF8C00"
        "#F5D76E"
        "#2CC2F8"
      ]
    } ]
  ).property "stat.totalCritical", "stat.totalHigh", "stat.totalMedium", "stat.totalLow"

`export default ChartComponentComponent`
