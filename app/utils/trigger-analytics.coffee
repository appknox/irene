triggerAnalytics = (funct, data) ->
  try
    if funct is "feature"
      analytics.feature(data)
    else if funct is "logout"
      analytics.logout()
    else if funct is "login"
      analytics.login(data.userId,data.accountId)
  catch error



`export default triggerAnalytics`
