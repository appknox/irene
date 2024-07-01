import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export type FooterComponent = 'file-details/api-scan/captured-apis/footer';

export default class ApiScanService extends Service {
  @tracked footerComponent: FooterComponent | null = null;
  @tracked footerComponentData: Record<string, unknown> = {};

  @action
  setFooterComponent(
    footerComponent: FooterComponent | null,
    data: Record<string, unknown>
  ) {
    this.footerComponent = footerComponent;
    this.footerComponentData = data;
  }
}
