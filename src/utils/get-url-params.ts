export function getUrlParams(url: string | null): { [key: string]: string } {
  if (!url)
    return {};

  const regex = /[?&]([^=#]+)=([^&#]*)/g;
  const params: { [key: string]: string } = {};
  let match: RegExpExecArray | null;

  do {
    match = regex.exec(url);
    if (match)
      params[match[1]] = decodeURIComponent(match[2]);
  } while (match !== null);

  return params;
}
