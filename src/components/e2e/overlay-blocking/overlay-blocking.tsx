import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useLivePreviewCtx } from "../../../context/live-preview-context-provider";
import { getOverlayBlockingPageRes } from "../../../helper/e2e-helper";
import { cslp } from "../../../utils/cslp";
import "./styles.scss";

/**
 * Fake CSLP used as a fallback before the content type / entry exists in the
 * stack. Once the entry is fetched successfully, real `entry.$[field]` attrs
 * replace these so the field editor opens correctly in Visual Builder.
 */
const FAKE_ENTRY_UID = "blt0000000000000001";

function fakeCslp(ctUid: string, field: string, locale: string): string {
  return `${ctUid}.${FAKE_ENTRY_UID}.${locale}.${field}`;
}

interface OverlayBlockingEntry {
  $: any;
  uid: string;
  locale: string;
  title: string;
  url: string;
  single_line: string;
  multi_line: string;
  number: number;
}

type FieldName = "title" | "url" | "single_line" | "multi_line" | "number";

interface ScenarioProps {
  id: string;
  title: string;
  description: string;
  blockerOn: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function Scenario(props: ScenarioProps): JSX.Element {
  const { id, title, description, blockerOn, onToggle, children } = props;
  return (
    <section
      className="ob__scenario"
      data-scenario={id}
      data-testid={`ob-scenario-${id}`}
    >
      <header className="ob__scenario-header">
        <h2 className="ob__scenario-title">
          Scenario {id.toUpperCase()} — {title}
        </h2>
        <button
          type="button"
          className="ob__toggle"
          onClick={onToggle}
          data-testid={`ob-toggle-${id}`}
        >
          {blockerOn ? "Disable blocker" : "Enable blocker"}
        </button>
      </header>
      <p className="ob__scenario-desc">{description}</p>
      <div className="ob__scenario-body">{children}</div>
    </section>
  );
}

const OVERLAY_BLOCKING_CT_UID = "overlay_blocking";

export default function OverlayBlocking(): JSX.Element {
  const ctUid = OVERLAY_BLOCKING_CT_UID;
  const lpTs = useLivePreviewCtx();
  const params = useParams();
  const locale = params.locale ?? "en-us";

  const [entry, setEntry] = useState<OverlayBlockingEntry | null>(null);
  const [fetchFailed, setFetchFailed] = useState(false);
  const [blockers, setBlockers] = useState<Record<string, boolean>>({
    a: false,
    b: true,
    c: true,
    d: true,
    e: true,
  });

  // Mirrors the flag read by csr/src/sdk/entry.ts when initializing the SDK.
  const overlayPropagationOn =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("overlayPropagation") ===
      "true";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await getOverlayBlockingPageRes(ctUid, locale);
        if (cancelled) return;
        if (result && result.$) {
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
  }, [ctUid, locale, lpTs]);

  const toggle = (id: string) => () =>
    setBlockers((prev) => ({ ...prev, [id]: !prev[id] }));

  // Returns spread props for a cslp element: real `entry.$[field]` when the
  // entry is loaded, otherwise a fake `data-cslp` so the page is still
  // usable for layout work before the CT is created.
  const cslpProps = (field: FieldName): Record<string, string> => {
    if (entry && entry.$ && entry.$[field]) {
      return cslp(entry.$[field] as Record<string, string>);
    }
    return cslp({ "data-cslp": fakeCslp(ctUid, field, locale) });
  };

  const valueFor = (field: FieldName, fallback: string): string => {
    const v = entry?.[field];
    if (v === undefined || v === null || v === "") return fallback;
    return String(v);
  };

  return (
    <div className="overlay-blocking" data-testid="overlay-blocking-container">
      <section className="overlay-blocking__intro">
        <h1>Visual Builder — overlay blocking bug repro</h1>
        <p>
          Each scenario contains an element with <code>data-cslp</code> that
          should be selectable in Visual Builder. With{" "}
          <code>overlayPropagation</code> disabled (default), scenarios B–E will
          fail to highlight on hover because a sibling element intercepts the
          mouse event.
        </p>
        <p
          className={
            "overlay-blocking__flag-status " +
            (overlayPropagationOn
              ? "overlay-blocking__flag-status--on"
              : "overlay-blocking__flag-status--off")
          }
          data-testid="ob-flag-status"
          data-flag-on={overlayPropagationOn}
        >
          <b>overlayPropagation:</b> {overlayPropagationOn ? "ON" : "OFF"} —{" "}
          {overlayPropagationOn ? (
            <>
              fallback active. Remove <code>?overlayPropagation=true</code> from
              the URL and reload to reproduce the bug.
            </>
          ) : (
            <>
              default behavior. Append <code>?overlayPropagation=true</code> to
              the URL and reload to enable the fix.
            </>
          )}
        </p>
        <p className="overlay-blocking__data-status">
          <b>Data source:</b>{" "}
          {entry
            ? `live entry (CT: ${ctUid}, locale: ${locale})`
            : fetchFailed
            ? `fake cslp fallback — no entry in CT "${ctUid}". Create the CT with fields title, url, single_line, multi_line, number and publish any entry.`
            : "loading…"}
        </p>
        <ul>
          <li>
            <b>A:</b> control — no blocker, must always work (field: title)
          </li>
          <li>
            <b>B:</b> sibling spacer overlapping via negative margin (field:
            single_line)
          </li>
          <li>
            <b>C:</b> absolute-positioned sibling covering the text (field: url)
          </li>
          <li>
            <b>D:</b> sibling with higher <code>z-index</code> (field:
            multi_line)
          </li>
          <li>
            <b>E:</b> stack of nested sibling blockers (field: number)
          </li>
        </ul>
      </section>

      {/* A — control */}
      <Scenario
        id="a"
        title="Control (no overlay)"
        description="Baseline. Should work with or without overlayPropagation."
        blockerOn={blockers.a}
        onToggle={toggle("a")}
      >
        <div className="ob__a">
          <div className="ob__cslp" {...cslpProps("title")}>
            {valueFor("title", "Edit me — scenario A (title)")}
          </div>
        </div>
      </Scenario>

      {/* B — sibling spacer in flex row */}
      <Scenario
        id="b"
        title="Sibling spacer (flex row + negative margin)"
        description="Mirrors the SKF case: empty sibling div in a CSS-grid-like row overlaps the data-cslp column."
        blockerOn={blockers.b}
        onToggle={toggle("b")}
      >
        <div className="ob__b">
          <div className="ob__b-text">
            <div className="ob__cslp" {...cslpProps("single_line")}>
              {valueFor("single_line", "Edit me — scenario B (single_line)")}
            </div>
          </div>
          {blockers.b && (
            <div
              className="ob__blocker ob__b-spacer"
              data-testid="ob-blocker-b"
            >
              <span className="ob__blocker-label">
                .spacer-div (sibling, blocks mouse)
              </span>
            </div>
          )}
        </div>
      </Scenario>

      {/* C — absolute positioned overlay */}
      <Scenario
        id="c"
        title="Absolute-positioned overlay"
        description="Sibling div with position:absolute; inset:0; pointer-events:auto covers the text."
        blockerOn={blockers.c}
        onToggle={toggle("c")}
      >
        <div className="ob__c">
          <div className="ob__cslp" {...cslpProps("url")}>
            {valueFor("url", "https://example.com (url)")}
          </div>
          {blockers.c && (
            <div
              className="ob__blocker ob__c-overlay"
              data-testid="ob-blocker-c"
            >
              <span className="ob__blocker-label">
                position: absolute; inset: 0
              </span>
            </div>
          )}
        </div>
      </Scenario>

      {/* D — z-index stacked overlay */}
      <Scenario
        id="d"
        title="Higher z-index sibling"
        description="Sibling element with higher z-index covers the data-cslp container."
        blockerOn={blockers.d}
        onToggle={toggle("d")}
      >
        <div className="ob__d">
          <div className="ob__cslp" {...cslpProps("multi_line")}>
            {valueFor("multi_line", "Edit me — scenario D (multi_line)")}
          </div>
          {blockers.d && (
            <div
              className="ob__blocker ob__d-zindex"
              data-testid="ob-blocker-d"
            >
              <span className="ob__blocker-label">z-index: 10</span>
            </div>
          )}
        </div>
      </Scenario>

      {/* E — nested stacked overlays */}
      <Scenario
        id="e"
        title="Nested stacked blockers"
        description="Multiple sibling divs (none with data-cslp) stacked on top of the field."
        blockerOn={blockers.e}
        onToggle={toggle("e")}
      >
        <div className="ob__e">
          <div className="ob__cslp" {...cslpProps("number")}>
            {valueFor("number", "42")}
          </div>
          {blockers.e && (
            <>
              <div
                className="ob__blocker ob__e-layer ob__e-layer-1"
                data-testid="ob-blocker-e-1"
              >
                <span className="ob__blocker-label">layer 1</span>
              </div>
              <div
                className="ob__blocker ob__e-layer ob__e-layer-2"
                data-testid="ob-blocker-e-2"
              >
                <span className="ob__blocker-label">layer 2</span>
              </div>
              <div
                className="ob__blocker ob__e-layer ob__e-layer-3"
                data-testid="ob-blocker-e-3"
              >
                <span className="ob__blocker-label">layer 3 (topmost)</span>
              </div>
            </>
          )}
        </div>
      </Scenario>
    </div>
  );
}
