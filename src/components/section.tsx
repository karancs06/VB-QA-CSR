import React from "react";
import { Link } from "react-router-dom";
import { SectionProps } from "../typescript/section";
import { getMultilineHTML } from "../helper";

export default function Section({ section }: { section: SectionProps }) {
  function contentSection() {
    return (
      <div className="home-content" key="section-1" data-testid="home-content">
        {section.title_h2 && (
          <h2 {...(section?.$?.title_h2 as {})} data-testid="section-title">
            {section.title_h2}
          </h2>
        )}
        {section.description && (
          <p
            className="multiline-field"
            {...(section?.$?.description as {})}
            data-testid="section-description"
          >
            {section.description}
          </p>
        )}
        {section.call_to_action.title && section.call_to_action.href ? (
          <Link
            {...section.call_to_action?.$?.title}
            to={section.call_to_action.href}
            className="btn secondary-btn"
            data-testid="call-to-action"
          >
            {section.call_to_action.title}
          </Link>
        ) : (
          ""
        )}
      </div>
    );
  }

  function imageContent() {
    return (
      <img
        {...(section.image?.$?.url as {})}
        src={section.image?.url}
        alt={section.image?.filename}
        key="section-2"
        data-testid="section-image"
      />
    );
  }
  return (
    <div className="home-advisor-section" data-testid="home-advisor-section">
      {section.image_alignment === "Left"
        ? [imageContent(), contentSection()]
        : [contentSection(), imageContent()]}
    </div>
  );
}
