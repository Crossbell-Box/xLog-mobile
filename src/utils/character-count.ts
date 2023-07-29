import removeMarkdown from "remove-markdown";

export default function countCharacters(str: string) {
  str = removeMarkdown(str);
  let count = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charAt(i);
    if (/[\u4E00-\u9FA5]/.test(chr)) {
      count += 2;
    }
    else {
      count += 1;
    }
  }
  return count;
}
