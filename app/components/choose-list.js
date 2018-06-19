import Ember from 'ember';
import FileListComponent from 'irene/components/file-list';

const ChooseListComponent = FileListComponent.extend({

  fileOld: null,

  hasObjects: Ember.computed.gt('objectCount', 1),

  otherFilesInTheProject: Ember.computed.filter('sortedObjects', function(file) {
    const fileId = this.get("fileOld.id");
    return fileId !== file.get("id");
  })
});

export default ChooseListComponent;
