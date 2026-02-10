import { MirageFactoryDefProps } from '../Mirage';

export type WS_MODEL_CREATED_PAYLOAD_MAP = {
  submission: {
    payload: {
      model_name: 'submission';
      data: MirageFactoryDefProps['submission'];
    };
  };
  file: {
    payload: {
      model_name: 'file';
      data: MirageFactoryDefProps['file'];
    };
  };
};

export type WS_MODEL_UPDATED_PAYLOAD_MAP = {
  'file-risk': {
    payload: {
      model_name: 'file-risk';
      data: MirageFactoryDefProps['file-risk'];
    };
  };
};
