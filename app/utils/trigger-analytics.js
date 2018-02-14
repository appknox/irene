/*
 * DS102: Remove unnecessary code created because of implicit returns
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
