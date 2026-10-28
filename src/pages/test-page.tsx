import React from "react";
import "../styles/testPage.scss";
import { useParams } from "react-router-dom";
import EffectiveContentChanges from "../components/e2e/effective-content-changes/effective-content-changes";
import AiAssistant from "../components/e2e/ai-assistant/ai-assistant";
import { TestingLocales } from "../components/e2e/effective-content-changes/testing-locales";
import OverlayBlocking from "../components/e2e/overlay-blocking/overlay-blocking";
import RteToolbarOverlap from "../components/e2e/rte-toolbar-overlap/rte-toolbar-overlap";

export default function TestPage() {
  const { testCtUid } = useParams();

  return (
    <div className="test-page-container" data-testid="test-page">
      <h1 className="test-page-title">E2E Testing Page</h1>
      <p className="test-page-description">
        This is a test page for E2E testing.
      </p>
      {getTestComponent(testCtUid ?? "")}
    </div>
  );
}

function getTestComponent(testCtUid: string) {
  if (testCtUid.includes("effective_content_changes")) {
    return <EffectiveContentChanges ctUid={testCtUid} />;
  }
  if (testCtUid.includes("ai_assistant_e2e")) {
    return <AiAssistant entryUrl={testCtUid} />;
  }
  if (testCtUid.includes("locales_e2e")) {
    return <TestingLocales ctUid={testCtUid} />;
  }
  if (testCtUid.includes("overlay_blocking")) {
    return <OverlayBlocking />;
  }
  if (testCtUid.includes("rte_toolbar_overlap")) {
    return <RteToolbarOverlap />;
  }

  return null;
}
