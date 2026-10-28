import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import { addEditableTags } from "@contentstack/utils";

import {
  resolveEntryFromUrl,
  ResolutionResult,
  CustomUrlConfig,
  PathPattern,
  FieldValue,
} from "../helper/customUrlResolver";
import { FieldsTable } from "../components/FieldsTable";
import customUrlConfig from "../config/customUrlConfig.json";
import SDK, { onEntryChange, setPageContext } from "../sdk/entry";

type PageState = "loading" | "no_match" | ResolutionResult;

/** Injected inter-entry links (Alt+click navigation tests set this per scenario). */
interface RelatedLink {
  label: string;
  href: string;
  /** Set to "_blank" to exercise the SDK's open-in-new-tab branch. */
  target?: string;
}

/**
 * Resolve the active custom-URL config. E2E specs inject a per-scenario config
 * via `window.__CUSTOM_URL_CONFIG__` (Playwright `page.addInitScript`) so the CSR
 * resolver stays in sync with the `preview_url_config` mocked in the builder.
 * Falls back to the committed `customUrlConfig.json` for local/dev runs.
 */
function getCustomUrlConfig(): CustomUrlConfig {
  const injected = (
    window as unknown as { __CUSTOM_URL_CONFIG__?: CustomUrlConfig }
  ).__CUSTOM_URL_CONFIG__;
  return (injected ?? customUrlConfig) as CustomUrlConfig;
}

/** Links to OTHER entries, injected per scenario for Alt+click navigation tests. */
function getRelatedLinks(): RelatedLink[] {
  const injected = (
    window as unknown as { __CSR_RELATED_LINKS__?: RelatedLink[] }
  ).__CSR_RELATED_LINKS__;
  return Array.isArray(injected) ? injected : [];
}

/**
 * QA-only (custom URL bug bash): a pattern built only from reference fields cannot be reversed
 * into a query, so fall back to the entry_uid / content_type_uid params VB and LP append.
 */
async function resolveFromQueryParams(): Promise<ResolutionResult | null> {
  const params = new URLSearchParams(window.location.search);
  const entryUid = params.get("entry_uid");
  const contentTypeUid = params.get("content_type_uid");
  if (!entryUid || !contentTypeUid) return null;
  const entries = await SDK.getEntryByField({
    contentTypeUid,
    field: "uid",
    value: entryUid,
    locale: params.get("locale"),
  });
  if (!entries?.length) return null;
  return {
    matchedPattern: { name: "QA fallback: entry_uid param", pattern: "(none)", content_types: [contentTypeUid] } as PathPattern,
    contentTypeUid,
    entry: entries[0],
    fieldValues: [],
  };
}

export default function CustomEntryPage() {
  const location = useLocation();

  const [state, setState] = useState<PageState>("loading");

  useEffect(() => {
    if (state === "loading" || state === "no_match") return;
    setPageContext({
      entryUid: state.entry.uid,
      contentTypeUid: state.contentTypeUid,
    });
  }, [state]);

  useEffect(() => {
    onEntryChange(() => {
      resolveEntryFromUrl(location.pathname, getCustomUrlConfig())
        .then(async (result) => result ?? (await resolveFromQueryParams()))
        .then((result) => setState(result ?? "no_match"))
        .catch(() => setState("no_match"));
    });
  }, [location.pathname]);

  // Full request line incl. query + hash (the suite asserts query/hash from here).
  const requestUrl =
    location.pathname + (location.search || "") + (location.hash || "");

  if (state === "loading") {
    return <Skeleton count={5} height={80} />;
  }

  if (state === "no_match") {
    return (
      <NoPatternMatch
        path={requestUrl}
        config={getCustomUrlConfig()}
        relatedLinks={getRelatedLinks()}
      />
    );
  }

  const { entry, matchedPattern, fieldValues, contentTypeUid } = state;
  // @ts-expect-error - entry shape varies by content type
  addEditableTags(entry, contentTypeUid, true);

  if (!entry) return <Skeleton count={5} height={80} />;

  return (
    <div style={{ padding: "1rem" }} data-testid="cs-csr--custom-entry-page">
      <ResolvedBanner
        pattern={matchedPattern}
        fieldValues={fieldValues}
        contentTypeUid={contentTypeUid}
        entryTitle={String((entry as Record<string, unknown>).title ?? "")}
        requestUrl={requestUrl}
      />
      <RelatedLinks links={getRelatedLinks()} />
      <FieldsTable entry={entry} />
    </div>
  );
}

// ─── ResolvedBanner ──────────────────────────────────────────────────────────
// Shows every asserted fact as plain labelled text, so behaviour is verifiable
// from a screenshot/video rather than by inspecting test-ids.

interface ResolvedBannerProps {
  pattern: PathPattern;
  fieldValues: FieldValue[];
  contentTypeUid: string;
  entryTitle: string;
  requestUrl: string;
}

function ResolvedBanner({
  pattern,
  fieldValues,
  contentTypeUid,
  entryTitle,
  requestUrl,
}: ResolvedBannerProps) {
  return (
    <div data-testid="cs-csr--resolved-banner" style={bannerStyle("#0a7d3c")}>
      <div style={statusHeadingStyle}>✅ CUSTOM URL RESOLVED</div>
      <BannerRow label="Content Type" value={contentTypeUid} testid="content-type" />
      <BannerRow label="Entry" value={entryTitle} testid="entry-title" />
      <BannerRow label="Matched Pattern" value={pattern.name} testid="matched-pattern-name" />
      <BannerRow label="Pattern" value={pattern.pattern} testid="matched-pattern" />
      <BannerRow label="Request URL" value={requestUrl} testid="request-url" />
      {fieldValues.map(({ fieldPath, value, verified }) => (
        <BannerRow
          key={fieldPath}
          label={`Field · ${fieldPath}`}
          value={`${value} ${verified ? "✓" : "⚠"}`}
          testid={`field-value-${fieldPath}`}
        />
      ))}
    </div>
  );
}

function BannerRow({
  label,
  value,
  testid,
}: {
  label: string;
  value: string;
  testid: string;
}) {
  return (
    <div style={{ display: "flex", gap: "8px", padding: "2px 0" }}>
      <span style={{ minWidth: "160px", fontWeight: 600 }}>{label}:</span>
      <span data-testid={`cs-csr--${testid}`} style={{ wordBreak: "break-all" }}>
        {value}
      </span>
    </div>
  );
}

// ─── RelatedLinks ────────────────────────────────────────────────────────────
// Plain anchors the builder intercepts on Alt+click. Targets are injected per
// scenario so navigation tests fully control "same entry / different entry / no
// matching pattern".

function RelatedLinks({ links }: { links: RelatedLink[] }) {
  if (links.length === 0) return null;
  return (
    <div data-testid="cs-csr--related-links" style={{ margin: "16px 0" }}>
      <div style={{ fontWeight: 600, marginBottom: "6px" }}>Related entries</div>
      <ul>
        {links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              target={link.target}
              rel={link.target ? "noopener noreferrer" : undefined}
              data-testid={`cs-csr--related-link-${link.label}`}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── NoPatternMatch ───────────────────────────────────────────────────────────

interface NoPatternMatchProps {
  path: string;
  config: CustomUrlConfig;
  relatedLinks: RelatedLink[];
}

function NoPatternMatch({ path, config, relatedLinks }: NoPatternMatchProps) {
  return (
    <div style={{ padding: "1rem", fontFamily: "sans-serif" }}>
      <div data-testid="cs-csr--no-match-banner" style={bannerStyle("#b00020")}>
        <div style={statusHeadingStyle}>❌ NO CUSTOM URL MATCH</div>
        <BannerRow label="Request URL" value={path} testid="request-url" />
      </div>
      <RelatedLinks links={relatedLinks} />
      {config.path_patterns.length > 0 && (
        <>
          <p>Configured patterns:</p>
          <ul style={{ fontFamily: "monospace" }}>
            {config.path_patterns.map((p) => (
              <li key={p.name}>
                <strong>{p.name}</strong>: {p.pattern}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

// ─── styles ───────────────────────────────────────────────────────────────────

function bannerStyle(accent: string): React.CSSProperties {
  return {
    background: "#f7faff",
    borderLeft: `6px solid ${accent}`,
    border: "1px solid #c7d6f5",
    borderRadius: "6px",
    padding: "14px 18px",
    marginBottom: "16px",
    fontFamily: "monospace",
    fontSize: "14px",
    color: "#14233c",
  };
}

const statusHeadingStyle: React.CSSProperties = {
  fontFamily: "sans-serif",
  fontWeight: 700,
  fontSize: "16px",
  marginBottom: "10px",
};
