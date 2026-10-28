import { addEditableTags } from "@contentstack/utils";
import Stack from "../sdk/entry";

export const getAiAssistantPageRes = async (
  entryUrl: string,
  locale: string,
) => {
  const ctUid = entryUrl.split("-")[0];
  const response = (await Stack.getEntryByUrl({
    contentTypeUid: ctUid,
    entryUrl: `/e2e/${entryUrl}`,
    referenceFieldPath: [],
    jsonRtePath: [
      "rich_text_editor",
      "json_rte",
      "markdown",
      "group.json_rte",
      "modular_blocks.level1.json_rte",
      "modular_blocks.level1.modular_block_2.level2.json_rte",
    ],
    locale,
  })) as any;
  const entry = response[0];
  addEditableTags(entry, ctUid, true, entry?.locale || locale);
  return entry;
};

/**
 * Fetches a `page` entry (with modular blocks) for the continuous-data-change
 * demo (VB-1994 / VB-2055) and tags it with entry-relative cslp so the heading
 * and each block are editable in Visual Builder.
 */
export const getAnimationPageRes = async (url: string, locale: string) => {
  const response = (await Stack.getEntryByUrl({
    contentTypeUid: "page",
    entryUrl: url,
    referenceFieldPath: [],
    jsonRtePath: [],
    locale,
  })) as any;
  const entry = response?.[0];
  if (entry) {
    addEditableTags(entry, "page", true, entry?.locale || locale);
  }
  return entry;
};

export const getEffectiveContentChangesPageRes = async (
  ctUid: string,
  locale: string,
) => {
  const response = (await Stack.getEntryByUrl({
    contentTypeUid: ctUid,
    entryUrl: `/e2e/${ctUid}`,
    referenceFieldPath: [],
    jsonRtePath: [
      "rich_text_editor",
      "json_rte",
      "rich_text_editor_multiple",
      "modular_blocks_nesting.0.level1.group_nesting.rich_text_editor",
    ],
    locale,
  })) as any;
  const entry = response[0];
  addEditableTags(entry, ctUid, true, entry?.locale || locale);
  return entry;
};

export const getOverlayBlockingPageRes = async (
  ctUid: string,
  locale: string,
) => {
  // Use getEntry (not getEntryByUrl) so the lookup does not depend on the
  // browser URL — search params like `?overlayPropagation=true` should not
  // affect entry resolution.
  const response = (await Stack.getEntry({
    contentTypeUid: ctUid,
    referenceFieldPath: [],
    jsonRtePath: [],
    locale,
  })) as any;
  const entry = response?.[0]?.[0];
  if (entry) {
    addEditableTags(entry, ctUid, true, entry?.locale || locale);
  }
  return entry;
};

/**
 * Fetches the RTE toolbar-overlap bug page with both references resolved and
 * tags each referenced entry with its OWN entry-relative cslp (like a real
 * customer site does), so the heading and the body belong to two different
 * entries/content types on the same page.
 */
export const getRteToolbarOverlapPageRes = async (
  ctUid: string,
  locale: string,
) => {
  const response = (await Stack.getEntry({
    contentTypeUid: ctUid,
    referenceFieldPath: ["heading_ref", "body_ref"],
    jsonRtePath: [],
    locale,
  })) as any;
  const entry = response?.[0]?.[0];
  if (!entry) return undefined;

  addEditableTags(entry, ctUid, true, entry?.locale || locale);

  const heading = entry.heading_ref?.[0];
  if (heading) {
    addEditableTags(
      heading,
      heading._content_type_uid || "bug_heading_details",
      true,
      heading?.locale || locale,
    );
  }
  const body = entry.body_ref?.[0];
  if (body) {
    addEditableTags(
      body,
      body._content_type_uid || "nested_reference_with_global_field",
      true,
      body?.locale || locale,
    );
  }
  return entry;
};
