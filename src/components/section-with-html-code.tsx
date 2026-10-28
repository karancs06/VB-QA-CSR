import React from "react";
import parse from "html-react-parser";
import { ObjectProps } from "../typescript/section";

export default function SectionWithHtmlCode({
  embedObject,
}: {
  embedObject: ObjectProps;
}) {
  if (embedObject.html_code_alignment === "Left") {
    return (
      <div
        className="contact-page-section max-width"
        data-testid="contact-page-section"
      >
        <div
          className="contact-page-content"
          data-testid="contact-page-content"
        >
          {embedObject.title && (
            <h1 {...(embedObject?.$?.title as {})} data-testid="embed-title">
              {embedObject.title}
            </h1>
          )}
          <div
            {...(embedObject?.$?.description as {})}
            data-testid="embed-description"
          >
            {embedObject.description && parse(embedObject.description)}
          </div>
        </div>
        <div
          className="contact-page-form"
          {...(embedObject?.$?.html_code as {})}
          data-testid="contact-page-form"
        >
          {embedObject.html_code && parse(embedObject.html_code)}
        </div>
      </div>
    );
  }
  return (
    <div
      className="contact-maps-section max-width"
      data-testid="contact-maps-section"
    >
      <div
        className="maps-details"
        {...(embedObject?.$?.html_code as {})}
        data-testid="maps-details"
      >
        {parse(embedObject.html_code)}
      </div>
      <div className="contact-maps-content" data-testid="contact-maps-content">
        {embedObject.title ? (
          <h2 {...(embedObject?.$?.title as {})} data-testid="embed-title">
            {embedObject.title}
          </h2>
        ) : (
          ""
        )}
        <div
          {...(embedObject?.$?.description as {})}
          data-testid="embed-description"
        >
          {" "}
          {embedObject.description && parse(embedObject.description)}
        </div>
      </div>
    </div>
  );
}
