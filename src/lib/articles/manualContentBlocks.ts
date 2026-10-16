export const LIST_ITEM = /^[-*] +/;

/**
 * Split manual content into blocks on blank lines (tolerating CRLF and
 * whitespace-only lines), and break "- " bullet runs out of any block so a
 * list that directly follows a line of text still renders as a list.
 */
export function manualContentBlocks(content: string): string[] {
  const out: string[] = [];
  for (const raw of content.replace(/\r\n?/g, "\n").split(/\n[ \t]*\n/)) {
    const lines = raw.split("\n");
    let buf: string[] = [];
    let inList = false;
    for (const line of lines) {
      const isItem = LIST_ITEM.test(line.trim());
      if (buf.length && isItem !== inList) {
        out.push(buf.join("\n"));
        buf = [];
      }
      inList = isItem;
      buf.push(isItem ? line.trim() : line);
    }
    const block = buf.join("\n").trim();
    if (block) out.push(block);
  }
  return out;
}
