import assert from "node:assert/strict";
import { test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ContactVisitingBlock } from "@/components/facility/ContactVisitingBlock";
import { FacilityFactBlock } from "@/components/facility/FacilityFactBlock";
import { getFacilityVerification } from "@/data/facilitySources";
import { getPrisonByCountryAndSlug } from "@/data/prisons";
import { contactVisitingRows } from "@/lib/seo/prisonContactVisiting";
import { prisonProfileJsonLdGraph } from "@/lib/seo/prisonJsonLd";
import { provenanceForField } from "@/lib/verification/factProvenance";

(globalThis as { React?: typeof React }).React = React;

test("verified profile facts carry the same source and checked date in the page and JSON-LD", () => {
  const prison = getPrisonByCountryAndSlug("uk", "hmp-belmarsh");
  assert.ok(prison);
  const verification = getFacilityVerification("uk", "hmp-belmarsh");
  const phone = provenanceForField(verification, "phone");
  assert.ok(phone);
  assert.equal(phone.name, "GOV.UK — HM Prison and Probation Service");
  assert.equal(phone.url, "https://www.gov.uk/guidance/belmarsh-prison");
  assert.equal(phone.checkedAt, "2026-08-20");

  const facts = renderToStaticMarkup(
    React.createElement(FacilityFactBlock, { prison, verification }),
  );
  assert.match(facts, /data-fact-provenance="phone"/);
  assert.match(facts, new RegExp(`Source: ${phone.name}\\. Checked ${phone.checkedAt}\\.`));

  const graph = prisonProfileJsonLdGraph({
    prison,
    path: "/prisons/uk/hmp-belmarsh",
    description: "Facility information",
  });
  const building = graph["@graph"][0] as {
    telephone?: string;
    citation?: { name: string; url: string; datePublished: string }[];
    dateModified?: string;
  };
  assert.equal(building.telephone, prison.phone);
  assert.ok(building.citation?.some((item) => item.url === phone.url && item.datePublished === phone.checkedAt && item.name === phone.name));
  assert.equal(building.dateModified, phone.checkedAt);
});

test("contact rows show provenance only for verified blocks", () => {
  const wandsworth = getPrisonByCountryAndSlug("uk", "hmp-wandsworth");
  assert.ok(wandsworth);
  const rows = contactVisitingRows(wandsworth, getFacilityVerification("uk", "hmp-wandsworth"));
  const bookingPhone = rows.find((row) => row.key === "visit-booking-phone");
  assert.equal(bookingPhone?.provenance?.checkedAt, "2026-10-17");
  assert.equal(bookingPhone?.provenance?.url, "https://www.gov.uk/guidance/wandsworth-prison");
  assert.equal(rows.find((row) => row.key === "send-money")?.provenance, undefined);
  assert.equal(rows.find((row) => row.key === "mailing-address")?.provenance?.checkedAt, "2026-10-17");

  const html = renderToStaticMarkup(React.createElement(ContactVisitingBlock, { rows }));
  assert.match(html, /data-fact-provenance="visit-booking-phone"/);
  assert.match(html, /Checked 2026-10-17/);
  const sendStart = html.indexOf('data-row="send-money"');
  const sendMoney = html.slice(sendStart, html.indexOf("data-row=", sendStart + 20));
  assert.doesNotMatch(sendMoney, /data-fact-provenance/);

  const ashfield = getPrisonByCountryAndSlug("uk", "hmp-ashfield");
  assert.ok(ashfield);
  const ashRows = contactVisitingRows(ashfield, getFacilityVerification("uk", "hmp-ashfield"));
  assert.equal(ashRows.find((row) => row.key === "phone")?.provenance, undefined);
  const ashGraph = prisonProfileJsonLdGraph({
    prison: ashfield,
    path: "/prisons/uk/hmp-ashfield",
    description: "Facility information",
  });
  const ashBuilding = ashGraph["@graph"][0] as { citation?: unknown; dateModified?: unknown; telephone?: unknown };
  assert.equal(ashBuilding.citation, undefined);
  assert.equal(ashBuilding.dateModified, undefined);
  assert.equal(ashBuilding.telephone, undefined);
});
