import test from "node:test";
import assert from "node:assert/strict";
import { joinPlaceParts } from "../src/lib/prisons/intlDisplay";

test("joinPlaceParts drops repeated place names", () => {
  assert.equal(joinPlaceParts(["Dublin", "Dublin", "Ireland"]), "Dublin, Ireland");
  assert.equal(joinPlaceParts(["Dublin", "dublin", "Ireland"]), "Dublin, Ireland");
  assert.equal(joinPlaceParts(["Portlaoise", "Co. Laois", "Laois", "Ireland"]), "Portlaoise, Co. Laois, Ireland");
});
