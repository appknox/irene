/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import Ember from 'ember';
import FileListComponent from 'irene/components/file-list';

const ChooseListComponent = FileListComponent.extend({

  fileOld: null,

  hasObjects: Ember.computed.gt('objectCount', 1),

  otherFilesInTheProject: Ember.computed.filter('sortedObjects', function(file) {
    const file_id = this.get("fileOld.id");
    return file_id !== file.get("id");
  })
});

export default ChooseListComponent;
