import ENV from 'irene/config/environment';

const triggerAnalytics = (type, data) =>{
  if(typeof window.analytics !== 'undefined'){
    try {
      if (type === "feature") {
        window.analytics.feature(data.feature, data.module, data.product);
      } else if (type === "logout") {
        window.analytics.logout();
      } else if (type === "login") {
        const logInFeatureData = ENV.csb.userLoggedIn;
        const {userName:first_name, userEmail:email, accountId:account_id} = data;
        
        const hasFullName = !!first_name && first_name.trim().length >0;
        const hasEmail = !!email && email.trim().length > 0;
        
        window.analytics.login(data.userId, data.accountId);
        
        // Identify user to populate name and/or email along with proper org association on CSB dashboard
        if(hasFullName && hasEmail){
          window.analytics.identify(data.userId,{first_name,email,account_id});
        }else if(hasEmail){
          window.analytics.identify(data.userId,{email,account_id});
        }
        // To publish user's login as an activity on the CSB dashboard and visulaization
        window.analytics.feature(logInFeatureData.feature, logInFeatureData.module, logInFeatureData.product);
      }
    } catch (error) {
      // ignore
    }
  }
};

export default triggerAnalytics;
