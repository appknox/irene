export function getPlatformMajorVersion(platformVersion?: string | null) {
  const majorVersion = platformVersion?.match(/\d+/)?.[0];

  return majorVersion ? Number.parseInt(majorVersion, 10) : null;
}
