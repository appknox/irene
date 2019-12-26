import DS from 'ember-data';
const { Model } = DS;
import {computed} from "@ember/object";
import { debug } from '@ember/debug';

export default Model.extend({

    EXPIRED: 'Expired',
    INPROGRESS: 'In Progress',
    AVAILABLE: 'Available',
    ERRORED: 'Errored',

    createdOn: DS.attr('date'),
    availableUntil: DS.attr('date'),
    generatedBy: DS.belongsTo('organization-user'),
    fromDate: DS.attr(),
    toDate: DS.attr(),
    progressPercent: DS.attr('number'),

    isAvailable: computed('status',function(){
        return this.get('status') === this.get('AVAILABLE')
    }),
    isInProgress: computed('status',function(){
        return this.get('status') === this.get('INPROGRESS')
    }),
    isExpired: computed('status',function(){
        return this.get('status') === this.get('EXPIRED')
    }),
    isErrrored: computed('status',function(){
        return this.get('status') === this.get('ERRORED')
    }),

    status: computed('availableUntil','progressPercent',function() {
        const expiryDate = this.get('availableUntil');
        const progressPercent = this.get('progressPercent');

        if(expiryDate < Date.now()){
            return this.EXPIRED;
        }

        if(progressPercent < 100){
            return this.INPROGRESS;
        }

        if(progressPercent === 100){
            return this.AVAILABLE;
        }

        return this.ERRORED;

    }),

    async downloadURL() {
      const adapter = this.store.adapterFor(this.constructor.modelName);
      let URL = null;
      try{
        const response = await adapter.getDownloadURL(this.get('id'));
        if(response && response.url && response.url.length > 0){
          URL =  response.url;
        }
        return URL;
      }catch(err){
        debug('Download organization archive URL network call failed');
        return URL;
      }
    }
});


