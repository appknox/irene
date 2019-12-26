import Component from '@ember/component';
import { task } from 'ember-concurrency';
import { on } from '@ember/object/evented';
import { inject as service } from '@ember/service';
import PaginateMixin from 'irene/mixins/paginate';

export default Component.extend(PaginateMixin, {
    organization: service('organization'),
    startDate: null,
    endDate: null,
    targetModel: 'organization-archive',
    sortProperties: ['id:desc'],

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
        yield archiveRecord.save();
        this.incrementProperty("version");
    }).evented(),

    onGenerateArchiveSuccess: on('tiggerGenerateArchive:succeeded', function() {
        this.get('notify').success('Archive Generation has been started.');
    }),

    onGenerateArchiveError: on('tiggerGenerateArchive:errored',function(_,err){
        this.get('notify').error(err.message);
    }),



    actions: {
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
