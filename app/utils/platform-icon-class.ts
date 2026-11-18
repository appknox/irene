import ENUMS from 'irene/enums';

/** Icon name for a project platform (the same mapping the project model uses). */
export default function platformIconClass(platform?: number | null) {
  switch (platform) {
    case ENUMS.PLATFORM.ANDROID:
      return 'android';
    case ENUMS.PLATFORM.IOS:
      return 'apple';
    case ENUMS.PLATFORM.WINDOWS:
      return 'windows';
    default:
      return 'mobile';
  }
}
