import Controller from '@ember/controller';

export default class FreestyleComponentController extends Controller {
  declare model: string;

  get sectionComponent(): string {
    const id = this.model ?? 'ak-accordion';
    return `${id}/freestyle-section`;
  }
}
