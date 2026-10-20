import assert from "node:assert/strict";
import { test } from "node:test";
import {
  serializePrisonImages,
  stabilizeImageRecord,
  stableImageText,
} from "../scripts/lib/stable-prison-images.mjs";

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
    {
      imageUrl: "https://upload.wikimedia.org/a.jpg",
      credit: "Jaggery",
      licence: "CC BY-SA 2.0",
      alt: "Exterior",
      author: "Jaggery",
      title: "Ashfield",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:A.jpg",
      licenceUrl: "https://creativecommons.org/licenses/by-sa/2.0",
    },
  );
  assert.equal(next.credit, "Jaggery");
  assert.equal(next.author, "Jaggery");
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
