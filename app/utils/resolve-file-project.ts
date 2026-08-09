import type Store from 'ember-data/store';
import type FileModel from 'irene/models/file';
import type ProjectModel from 'irene/models/project';

/**
 * Resolve a file's parent project without triggering getBelongsTo proxy side
 * effects during render.
 *
 * Prefers the already-loaded belongsTo value; otherwise resolves the relation
 * id via `store.findRecord`. Returns `null` when the file has no project.
 */
export async function resolveFileProject(
  file: FileModel,
  store: Store
): Promise<ProjectModel | null> {
  const project = file.belongsTo('project').value() as ProjectModel | null;

  if (project) {
    return project;
  }

  const projectId = file.belongsTo('project').id();

  if (!projectId) {
    return null;
  }

  return (await store.findRecord('project', projectId)) as ProjectModel;
}
