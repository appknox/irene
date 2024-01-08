import { ValidatorMapFunc } from 'ember-changeset/types';

export default function validateEquality({
  expected,
  message,
}: {
  expected: boolean;
  message: string;
}): ValidatorMapFunc {
  return function (_, value) {
    if (value && value === expected) {
      return true;
    }

    return message;
  };
}
