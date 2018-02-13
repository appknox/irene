/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const triggerAnalytics = function(funct, data) {
  try {
    if (funct === "feature") {
      return analytics.feature(data);
    } else if (funct === "logout") {
      return analytics.logout();
    } else if (funct === "login") {
      return analytics.login(data.userId,data.accountId);
    }
  } catch (error) {}
};



export default triggerAnalytics;
