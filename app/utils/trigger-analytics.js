// jshint ignore: start
const triggerAnalytics = function(funct, data) {
  try {
    if (funct === "feature") {
      // eslint-disable-next-line
      return analytics.feature(data.feature, data.module, data.product);
    } else if (funct === "logout") {
      // eslint-disable-next-line
      return analytics.logout();
    } else if (funct === "login") {
      // eslint-disable-next-line
      return analytics.login(data.userId,data.accountId);
    }
    // eslint-disable-next-line
  } catch (error) {

  }
};

export default triggerAnalytics;
