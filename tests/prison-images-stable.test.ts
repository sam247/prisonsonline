import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { loadPublishableImageRows, loadSheetCreditBaseline, publishImageRows } from "../scripts/build-prison-images.mjs";
import {
  serializePrisonImages,
  stabilizeImageRecord,
  stableImageText,
} from "../scripts/lib/stable-prison-images.mjs";

const root = path.resolve(__dirname, "..");

test("image JSON is sorted and byte-stable", () => {
  const records = {
    "hmp-belmarsh": {
      caption: "Gate",
      credit: "A",
      imageUrl: "https://upload.wikimedia.org/a.jpg",
      licence: "CC BY-SA 2.0",
    },
    "hmp-ashfield": {
      imageUrl: "https://upload.wikimedia.org/b.jpg",
      licence: "CC BY 2.0",
      credit: "B",
    },
  };
  const once = serializePrisonImages(records);
  const twice = serializePrisonImages({
    "hmp-ashfield": records["hmp-ashfield"],
    "hmp-belmarsh": records["hmp-belmarsh"],
  });
  assert.equal(once, twice);
  assert.ok(once.indexOf('"hmp-ashfield"') < once.indexOf('"hmp-belmarsh"'));
  assert.match(once, /"imageUrl":[\s\S]*"credit":[\s\S]*"licence":/);
  assert.ok(once.endsWith("\n"));
});

test("whitespace-only credit changes keep the committed string", () => {
  assert.equal(stableImageText("Jaggery ", "Jaggery"), "Jaggery");
  assert.equal(stableImageText("Someone else", "Jaggery"), "Someone else");
  const committed = {
    imageUrl: "https://upload.wikimedia.org/a.jpg",
    credit: "Jaggery",
    licence: "CC BY-SA 2.0",
    alt: "Exterior",
    author: "Jaggery",
    title: "Ashfield",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:A.jpg",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  };
  const next = stabilizeImageRecord(
    {
      imageUrl: "https://upload.wikimedia.org/a.jpg?utm=1",
      credit: "Jaggery\n",
      licence: "CC BY-SA 2.0",
      alt: "Exterior",
      author: "Jaggery ",
      title: "Ashfield",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:A.jpg#top",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/2.0",
    },
    committed,
    { sheetCredit: "Jaggery", previousSheetCredit: "Jaggery" },
  );
  assert.equal(next.credit, "Jaggery");
  assert.equal(next.author, "Jaggery");
  const noisy = stabilizeImageRecord(
    {
      imageUrl: committed.imageUrl,
      credit: "Someone else",
      licence: committed.licence,
      alt: committed.alt,
      author: "Someone else",
      title: committed.title,
      sourceUrl: committed.sourceUrl,
    },
    committed,
    { sheetCredit: "Jaggery", previousSheetCredit: "Jaggery" },
  );
  assert.equal(noisy.credit, "Jaggery");
  assert.equal(noisy.author, "Jaggery");
  assert.equal(next.imageUrl, "https://upload.wikimedia.org/a.jpg");
  assert.equal(next.sourceUrl, "https://commons.wikimedia.org/wiki/File:A.jpg");
  assert.deepEqual(Object.keys(next), [
    "imageUrl",
    "credit",
    "licence",
    "alt",
    "author",
    "title",
    "sourceUrl",
    "licenceUrl",
  ]);
});

const LONG_CZMARLIN =
  "CZmarlin — Christopher Ziemnowicz, own work. This photograph was taken by User:CZmarlin and is used under CC BY-SA 3.0.";
const HYPHEN_EMAIL = "paul.parsons@hyphen.co.za";

function noisyCommonsAuthor(slug: string) {
  if (slug === "alderson-fpc") return LONG_CZMARLIN;
  if (slug.startsWith("zonderwater-medium-")) return `Paul Parsons ${HYPHEN_EMAIL}`;
  return "User:P199 ( talk ) ( Uploads )";
}

test("live-fetch build keeps committed credit and author", () => {
  const existing = JSON.parse(readFileSync(path.join(root, "src/data/prisonImages.json"), "utf8")) as Record<
    string,
    { imageUrl: string; credit: string; author: string; licence: string; licenceUrl?: string; title?: string; sourceUrl: string }
  >;
  const rows = loadPublishableImageRows() as Array<{
    slug: string;
    fileTitle: string;
    credit: string;
    licence: string;
    licenceUrl: string;
    alt: string;
    caption: string;
  }>;
  const sheetCredits = loadSheetCreditBaseline() as Record<string, string>;
  const commonsInfo = new Map<
    string,
    { imageUrl: string; sourceUrl: string; licence: string; licenceUrl: string; author: string; title: string }
  >();
  for (const row of rows) {
    const prev = existing[row.slug];
    assert.ok(prev, `${row.slug} is missing from committed prisonImages.json`);
    commonsInfo.set(row.fileTitle, {
      imageUrl: prev.imageUrl,
      sourceUrl: prev.sourceUrl,
      licence: prev.licence,
      licenceUrl: prev.licenceUrl ?? "",
      author: noisyCommonsAuthor(row.slug),
      title: prev.title ?? "",
    });
  }

  const out = publishImageRows({ rows, commonsInfo, existing, sheetCredits }) as Record<
    string,
    { credit?: string; author?: string }
  >;

  assert.deepEqual(Object.keys(out).sort(), Object.keys(existing).sort());
  const diffs: string[] = [];
  for (const slug of Object.keys(existing)) {
    if (out[slug].credit !== existing[slug].credit || out[slug].author !== existing[slug].author) {
      diffs.push(
        `${slug}: credit ${JSON.stringify(existing[slug].credit)} -> ${JSON.stringify(out[slug].credit)}; author ${JSON.stringify(existing[slug].author)} -> ${JSON.stringify(out[slug].author)}`,
      );
    }
  }
  assert.deepEqual(diffs, []);
  const published = JSON.stringify(out);
  assert.equal(published.includes(HYPHEN_EMAIL), false);
  assert.equal(published.includes("CZmarlin"), false);
  assert.equal(published.includes("User:P199"), false);
  assert.equal(published.includes("( talk )"), false);
  assert.equal(published.includes("( Uploads )"), false);
  assert.equal(out["alderson-fpc"].credit, "Christopher Ziemnowicz");
  assert.equal(out["alderson-fpc"].author, "Christopher Ziemnowicz");
  assert.equal(out["zonderwater-medium-a-correctional-centre"].credit, "Paul Parsons");
  assert.equal(out["zonderwater-medium-b-correctional-centre"].author, "Paul Parsons");
});

test("a new Commons file or a changed sheet credit replaces credit and author", () => {
  const row = {
    slug: "zonderwater-medium-a-correctional-centre",
    fileTitle: "File:Zonderwater Prison-001.jpg",
    credit: "Paul Parsons",
    licence: "CC BY-SA 3.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/3.0",
    alt: "Exterior",
    caption: "Complex",
  };
  const existing = {
    [row.slug]: {
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a1/Zonderwater_Prison-001.jpg",
      credit: "Paul Parsons",
      licence: "CC BY-SA 3.0",
      alt: "Exterior",
      author: "Paul Parsons",
      title: "Zonderwater Prison-001",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Zonderwater_Prison-001.jpg",
    },
  };
  const noisy = {
    imageUrl: existing[row.slug].imageUrl,
    sourceUrl: existing[row.slug].sourceUrl,
    licence: "CC BY-SA 3.0",
    licenceUrl: row.licenceUrl,
    author: `Paul Parsons ${HYPHEN_EMAIL}`,
    title: "Zonderwater Prison-001",
  };

  const sheetChanged = publishImageRows({
    rows: [{ ...row, credit: "Studio Photographer" }],
    commonsInfo: new Map([[row.fileTitle, noisy]]),
    existing,
    sheetCredits: { [row.slug]: "Paul Parsons" },
  }) as Record<string, { credit: string; author: string }>;
  assert.equal(sheetChanged[row.slug].credit, "Studio Photographer");
  assert.equal(sheetChanged[row.slug].author, "Studio Photographer");
  assert.equal(JSON.stringify(sheetChanged).includes(HYPHEN_EMAIL), false);

  const fileChanged = publishImageRows({
    rows: [{ ...row, fileTitle: "File:Zonderwater Prison-002.jpg" }],
    commonsInfo: new Map([
      [
        "File:Zonderwater Prison-002.jpg",
        {
          ...noisy,
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b0/Zonderwater_Prison-002.jpg",
          sourceUrl: "https://commons.wikimedia.org/wiki/File:Zonderwater_Prison-002.jpg",
          author: LONG_CZMARLIN,
        },
      ],
    ]),
    existing,
    sheetCredits: { [row.slug]: "Paul Parsons" },
  }) as Record<string, { credit: string; author: string }>;
  assert.equal(fileChanged[row.slug].credit, LONG_CZMARLIN);
  assert.equal(fileChanged[row.slug].author, LONG_CZMARLIN);

  const clearedSheet = publishImageRows({
    rows: [{ ...row, credit: "" }],
    commonsInfo: new Map([[row.fileTitle, noisy]]),
    existing,
    sheetCredits: { [row.slug]: "Paul Parsons" },
  }) as Record<string, { credit: string; author: string }>;
  assert.equal(clearedSheet[row.slug].credit, "Paul Parsons");
  assert.equal(clearedSheet[row.slug].author, "Paul Parsons");
});
