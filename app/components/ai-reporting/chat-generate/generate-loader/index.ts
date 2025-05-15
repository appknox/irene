import Component from '@glimmer/component';

export default class AiReportingChatGenerateGenerateLoaderComponent extends Component {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AiReporting::ChatGenerate::GenerateLoader': typeof AiReportingChatGenerateGenerateLoaderComponent;
  }
}
