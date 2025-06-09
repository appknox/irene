import Component from '@glimmer/component';

export default class AiReportingChatGenerateLoaderComponent extends Component {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AiReporting::ChatGenerate::Loader': typeof AiReportingChatGenerateLoaderComponent;
  }
}
