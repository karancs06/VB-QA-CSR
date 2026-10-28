import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useLivePreviewCtx } from "../../../context/live-preview-context-provider";
import { getRteToolbarOverlapPageRes } from "../../../helper/e2e-helper";
import { cslp } from "../../../utils/cslp";
import "./styles.scss";

/**
 * Repro for the RTE toolbar-overlap bug (support 00059438):
 *
 * The page renders a heading from one referenced entry (`bug_heading_details`)
 * directly above rich text from another referenced entry
 * (`nested_reference_with_global_field`) with no gap. When the body text field
 * is focused, the SDK's field toolbar renders on top of the heading. Clicking
 * the toolbar's edit (pencil) button is ALSO treated as a canvas click on the
 * heading when `?overlayPropagation=true` (the SDK's capture-phase click
 * listener pierces its own toolbar via `document.elementsFromPoint`), so a
 * FOCUS_FIELD for the heading's entry lands after the edit modal opened for
 * the body's entry — the quick form ends up bound to the wrong entry and the
 * modal's Apply is lost.
 *
 * Route: /e2e/bug_rte_toolbar_overlap?overlayPropagation=true
 */
const RTE_TOOLBAR_OVERLAP_CT_UID = "bug_rte_toolbar_overlap";

interface ReferencedEntry {
  $?: Record<string, unknown>;
  uid: string;
  _content_type_uid?: string;
  h1_title_rte?: string;
  global_field?: { rich_text_editor?: string };
}

interface RteToolbarOverlapEntry {
  $?: Record<string, unknown>;
  uid: string;
  title: string;
  heading_ref?: ReferencedEntry[];
  body_ref?: ReferencedEntry[];
}

export default function RteToolbarOverlap(): JSX.Element {
  const lpTs = useLivePreviewCtx();
  const params = useParams();
  const locale = params.locale ?? "en-us";

  const [entry, setEntry] = useState<RteToolbarOverlapEntry | null>(null);
  const [fetchFailed, setFetchFailed] = useState(false);

  // Mirrors the flag read by csr/src/sdk/entry.ts when initializing the SDK.
  const overlayPropagationOn =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("overlayPropagation") ===
      "true";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await getRteToolbarOverlapPageRes(
          RTE_TOOLBAR_OVERLAP_CT_UID,
          locale,
        );
        if (cancelled) return;
        if (result) {
          setEntry(result);
          setFetchFailed(false);
        } else {
          setFetchFailed(true);
        }
      } catch {
        if (!cancelled) setFetchFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [locale, lpTs]);

  const heading = entry?.heading_ref?.[0];
  const body = entry?.body_ref?.[0];

  return (
    <div className="rte-toolbar-overlap" data-testid="rte-toolbar-overlap">
      <section className="rto__intro">
        <h2>Visual Builder — RTE toolbar overlap bug repro</h2>
        <p>
          The heading below belongs to <code>bug_heading_details</code>; the
          text under it belongs to{" "}
          <code>nested_reference_with_global_field</code> (global field HTML
          RTE). They render with no gap, so the body field&apos;s toolbar
          covers the heading.
        </p>
        <p>
          Repro: click the body text, click the edit (pencil) button, change
          the text, Apply. Requires <code>?overlayPropagation=true</code>{" "}
          (currently{" "}
          <strong data-testid="rto-overlay-propagation">
            {overlayPropagationOn ? "ON" : "OFF"}
          </strong>
          ).
        </p>
        {fetchFailed ? (
          <p className="rto__error" data-testid="rto-fetch-failed">
            Entry fetch failed — create the `bug_rte_toolbar_overlap` page
            entry with `heading_ref` and `body_ref` populated.
          </p>
        ) : null}
      </section>

      <section className="rto__stage" data-testid="rto-stage">
        <div
          className="rto__heading"
          data-testid="rto-heading"
          {...cslp(heading?.$?.h1_title_rte)}
          dangerouslySetInnerHTML={{
            __html: heading?.h1_title_rte ?? "<p>Heading placeholder</p>",
          }}
        />
        <div
          className="rto__body"
          data-testid="rto-body"
          {...cslp(
            (body?.global_field as { $?: Record<string, unknown> })?.$
              ?.rich_text_editor,
          )}
          dangerouslySetInnerHTML={{
            __html:
              body?.global_field?.rich_text_editor ??
              "<p>Body text placeholder</p>",
          }}
        />
      </section>
    </div>
  );
}
