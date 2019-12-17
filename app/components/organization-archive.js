import Component from '@ember/component';
    
export default Component.extend({
    archives: [],
    startDate: null,
    endDate: null,

    fetchAllArchives() {
        this.get('store').findAll('organization-archive').then((archives)=>{
            this.set('archives',archives);
        });
    },

    didInsertElement() {
        this.fetchAllArchives();
    },

    

    actions: {
        async initArchiveGeneration(){
            const archiveTask = await this.get('store').createRecord('organization-archive');
            archiveTask.save();
        },

        setStartDate(date){
            this.set('startDate',date);
        }
    }

});
