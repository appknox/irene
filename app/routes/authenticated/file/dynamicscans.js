import Route from '@ember/routing/route';
import config from 'irene/config/environment';

export default Route.extend({
    title: `File Dynamic Scans${config.platform}`,
    async model(){
      const file = await this.modelFor('authenticated.file');
      let currentDynamicScan = null;
      try{
        currentDynamicScan = await file.currentDynamicScan();
      }catch(error){
        // Do nothing
      }
      return {file: file, currentDynamicScan: currentDynamicScan};
    }
});
