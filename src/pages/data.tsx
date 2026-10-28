import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import SDK, { onEntryChange, currentBranch } from "../sdk/entry";
import { addEditableTags } from "@contentstack/utils";
import Accordion from "../components/Accordion";
import { FieldsTable } from "../components/FieldsTable";

const getEntryByUrl = SDK.getEntryByUrl;

// Only this page-owned flag is allowed to ride along with the entry URL.
// Everything else (VE-injected params like entry_uid, content_type_uid,
// live_preview, builder, plus anything unrecognised) is dropped so it can't
// churn effect deps or leak into the lookup string.
function filterAppSearchParams(search: string): string {
  if (!search) return "";
  const incoming = new URLSearchParams(search);
  const value = incoming.get("empty_multiple_blocks");
  if (value === null) return "";
  const filtered = new URLSearchParams();
  filtered.set("empty_multiple_blocks", value);
  return `?${filtered.toString()}`;
}

// Opt-in: render an empty-block-parent <td> for empty multiple fields so the
// SDK can hydrate the "Add <FieldName>" empty-state UI. Off by default —
// historical behavior was to skip rendering empty arrays entirely, which the
// canvas/variant specs still rely on. Enable per-spec via the
// ?empty_multiple_blocks=1 query param on the test URL.
function isEmptyMultipleBlocksEnabled(search: string): boolean {
  if (!search) return false;
  const value = new URLSearchParams(search).get("empty_multiple_blocks");
  return value === "1" || value === "true";
}

const referenceFieldPath: string[] = [
  "reference",
  "reference_multiple_ct",
  "reference_multiple",
  "reference_multiple_multiple_ct",
];
const jsonRtePath: string[] = ["json_rte", "json_rich_text_editor_multiple"];
const AllFields = () => {
  const { contentTypeUid, locale } = useParams();
  const location = useLocation();
  const appSearch = filterAppSearchParams(location.search);
  // Strip the `/locale/<locale>` route prefix so the lookup matches the stored
  // entry `url` (e.g. `/data/<ct>/<slug>`) on both standalone and locale routes.
  const localePrefix = locale ? `/locale/${locale}` : "";
  const pathname =
    localePrefix && location.pathname.startsWith(localePrefix)
      ? location.pathname.slice(localePrefix.length)
      : location.pathname;
  const entryUrl = `${pathname}${appSearch}`;

  const [allFieldsEntry, setAllFieldsEntry] = useState<Record<
    string,
    any
  > | null>(null);

  const fetchEntry = useCallback(
    (url: string) => {
      getEntryByUrl({
        entryUrl: url,
        // @ts-expect-error - this will be present
        contentTypeUid: contentTypeUid,
        referenceFieldPath,
        jsonRtePath,
        includeAll: true,
        locale,
      })
        .then((result) => {
          // @ts-expect-error - SDK return type is loose
          const entry = { ...(result?.[0] ?? {}) };
          // @ts-expect-error - this will be present
          // addEditableTags defaults locale to "en-us" when omitted
          addEditableTags(entry, contentTypeUid, true, entry.locale);
          setAllFieldsEntry(entry);
        })
        .catch((error) => {
          console.log(error);
        });
    },
    [contentTypeUid, locale],
  );

  useEffect(() => {
    if (!entryUrl) return;
    fetchEntry(entryUrl);
  }, [entryUrl, fetchEntry]);

  useEffect(() => {
    if (!entryUrl) return;
    onEntryChange(() => fetchEntry(entryUrl), { skipInitialRender: true });
  }, [entryUrl, fetchEntry]);

  if (!allFieldsEntry) {
    return <div>Loading...</div>;
  }
  const emptyMultipleBlocksEnabled = isEmptyMultipleBlocksEnabled(
    location.search,
  );

  return (
    <>
      <h1 className="advance-fields-heading">AllFields</h1>
      <p className="branch-name" data-testid="csr-branch-name">
        Branch: <strong>{currentBranch || "—"}</strong>
      </p>
      <FieldsTable
        entry={allFieldsEntry}
        emptyMultipleBlocksEnabled={emptyMultipleBlocksEnabled}
      />
      <Accordion
        title={allFieldsEntry?.title}
        titleCslp={allFieldsEntry?.$?.title}
      >
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis magni
        iste praesentium voluptas, beatae quasi delectus minus facere saepe
        architecto expedita quae nobis. A nesciunt at ex excepturi corporis
        harum?
      </Accordion>
    </>
  );
};

export default AllFields;
