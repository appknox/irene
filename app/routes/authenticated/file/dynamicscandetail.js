import Route from '@ember/routing/route';
import config from 'irene/config/environment';
import ScrollTopMixin from 'irene/mixins/scroll-top';

export default Route.extend(ScrollTopMixin, {
    title: `File Dynamic Scan Details${config.platform}`,
    async model(params){
     let dynamicscan = await this.get('store').find('dynamicscan', params.dynamicscanid);
     let file =this.modelFor('authenticated.file');
     return {dynamicscan: dynamicscan, file: file};
    }
});
