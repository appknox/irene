import Route from '@ember/routing/route';
import config from 'irene/config/environment';
import { inject as service } from '@ember/service';

export default Route.extend({
  title: `File Details${config.platform}`,
  scrollTo: service('scroll-to'),
  selectedAnalysis:null,
  beforeModel() {
    const analysisSelector = this.get('scrollTo.afterTransition.target');
    if (analysisSelector && (analysisSelector.replace("#analysis-", "")!=="undefined")){
      this.set('selectedAnalysis', analysisSelector.replace("#analysis-", ""));
    }
  },
  async model(){
    const file = await this.modelFor('authenticated.file');
    let currentDynamicScan = null;
    try{
      currentDynamicScan = await file.currentDynamicScan();
    }catch(error){
      // Do nothing
    }
    return {file: file, selectedAnalysis: this.get('selectedAnalysis'), currentDynamicScan:currentDynamicScan};
  },

});
