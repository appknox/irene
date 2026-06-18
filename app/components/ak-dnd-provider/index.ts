import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export interface AkDndProviderApi<T> {
  items: T[];
  draggingIndex: number | null;
  dragOverIndex: number | null;
  isDragging: boolean;
  onDragStart: (index: number, event: DragEvent) => void;
  onDragOver: (index: number, event: DragEvent) => void;
  onDragLeave: (index: number, event: DragEvent) => void;
  onDrop: (index: number, event: DragEvent) => void;
  onDragEnd: (event: DragEvent) => void;
}

export interface AkDndProviderSignature<T = unknown> {
  Args: {
    items: T[];
    onReorder: (items: T[], fromIndex: number, toIndex: number) => void;
  };
  Blocks: {
    default: [AkDndProviderApi<T>];
  };
}

/**
 * Renderless drag-and-drop list reordering provider.
 *
 * Owns the drag lifecycle state and the reorder computation only —
 * consumers wire the yielded handlers onto whatever markup they like:
 *
 * ```hbs
 * <AkDndProvider @items={{this.rows}} @onReorder={{this.reorder}} as |dnd|>
 *   {{#each dnd.items as |item index|}}
 *     <div
 *       draggable='true'
 *       {{on 'dragstart' (fn dnd.onDragStart index)}}
 *       {{on 'dragover' (fn dnd.onDragOver index)}}
 *       {{on 'dragleave' (fn dnd.onDragLeave index)}}
 *       {{on 'drop' (fn dnd.onDrop index)}}
 *       {{on 'dragend' dnd.onDragEnd}}
 *     >
 *       ...
 *     </div>
 *   {{/each}}
 * </AkDndProvider>
 * ```
 */
export default class AkDndProviderComponent<T> extends Component<
  AkDndProviderSignature<T>
> {
  @tracked draggingIndex: number | null = null;
  @tracked dragOverIndex: number | null = null;

  get isDragging() {
    return this.draggingIndex !== null;
  }

  @action
  handleDragStart(index: number, event: DragEvent) {
    this.draggingIndex = index;

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', String(index));
    }
  }

  @action
  handleDragOver(index: number, event: DragEvent) {
    // Required for the browser to allow dropping here
    event.preventDefault();

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }

    if (this.dragOverIndex !== index) {
      this.dragOverIndex = index;
    }
  }

  @action
  handleDragLeave(index: number) {
    if (this.dragOverIndex === index) {
      this.dragOverIndex = null;
    }
  }

  @action
  handleDrop(index: number, event: DragEvent) {
    event.preventDefault();

    const fromIndex = this.draggingIndex;

    this.resetDragState();

    if (fromIndex === null || fromIndex === index) {
      return;
    }

    const reordered = [...this.args.items];
    const [moved] = reordered.splice(fromIndex, 1);

    reordered.splice(index, 0, moved as T);

    this.args.onReorder(reordered, fromIndex, index);
  }

  @action
  handleDragEnd() {
    this.resetDragState();
  }

  resetDragState() {
    this.draggingIndex = null;
    this.dragOverIndex = null;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkDndProvider: typeof AkDndProviderComponent;
  }
}
