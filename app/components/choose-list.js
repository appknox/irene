/* eslint-disable prettier/prettier, ember/no-get */
import { computed } from '@ember/object';
import FileListComponent from 'irene/components/file-list';

const ChooseListComponent = FileListComponent.extend({

  fileOld: null,

  hasObjects: computed.gt('objectCount', 1),

  otherFilesInTheProject: computed.filter('sortedObjects', function(file) {
    const fileId = this.get("fileOld.id");
    return fileId !== file.get("id");
  })
});

export default ChooseListComponent;
