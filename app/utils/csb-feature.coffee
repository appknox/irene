csbFeature = (data) ->
  try
    analytics.feature(data)
  catch error

`export default csbFeature`
