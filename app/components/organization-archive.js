import Component from '@ember/component';
import { task } from 'ember-concurrency';
import { on } from '@ember/object/evented';
import { inject as service } from '@ember/service';
    
export default Component.extend({
    organization: service('organization'),
    archives: [],
    startDate: null,
    endDate: null,
    isGenerationRequestInProcess: false,

    fetchAllArchives() {
        this.get('store').findAll('organization-archive').then((archives)=>{
            this.set('archives',archives);
        });
    },

    didInsertElement() {
        this.fetchAllArchives();
    },

    validateDates(){
        let vaildationObject = {isValid: true, message: ''};
        const startDateObj = this.get('startDate');
        const endDateObj = this.get('endDate');
        if(startDateObj && endDateObj && endDateObj < startDateObj){
            vaildationObject.isValid = false;
            vaildationObject.message = 'end date cannot be lesser than start date';
        }

        if(startDateObj > Date.now()){
            vaildationObject.isValid = false;
            vaildationObject.message ='start date cannot be in future';
        }

        if(endDateObj > Date.now()){
            vaildationObject.isValid = false;
            vaildationObject.message= 'end date cannot be in future';
        }
        return vaildationObject;
    },

    tiggerGenerateArchive: task(function * () {
        this.set('isGenerationRequestInProcess', true);

        const startDateObj = this.get('startDate');
        const endDateObj = this.get('endDate');
        const requestParams = {};
        
        const {isValid,message} = this.validateDates();
        if(!isValid){
            throw new Error(message);
        }
        
        if(startDateObj) {
            requestParams["from_date"]  = startDateObj.toISOString();
        }
        if(endDateObj) {
            requestParams["to_date"] = endDateObj.toISOString();
        }

        const archiveRecord = yield this.store.createRecord('organization-archive', {fromDate:requestParams["from_date"] , toDate:requestParams["to_date"]});
        archiveRecord.save();

    }).evented(),

    onGenerateArchiveSuccess: on('tiggerGenerateArchive:succeeded', function() {
        this.get('notify').success('Archive Generation has been started.');
        this.set('isGenerationRequestInProcess', false);
    }),

    onGenerateArchiveError: on('tiggerGenerateArchive:errored',function(_,err){
        this.get('notify').error(err.message);
        this.set('isGenerationRequestInProcess', false);
    }),

    

    actions: {
        
        initArchiveGeneration(){
            try{
                this.get('tiggerGenerateArchive').perform();
            }catch(err){
                this.get('notify').error(err.message);
                this.set('isGenerationRequestInProcess', false);
            }
        },

        setStartDate(date){
            this.set('startDate',date);
        },

        setEndDate(date){
            this.set('endDate',date);
        },

        resetStartDate(){
            this.set('startDate', null);
        },

        resetEndDate(){
            this.set('endDate',null);
        }
    }

});
