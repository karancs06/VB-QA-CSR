import React from "react";
import { Link } from "react-router-dom";
import parse from "html-react-parser";
import { BucketProps } from "../typescript/section";
import { getMultilineHTML } from "../helper";

export default function SectionBucket({ section }: { section: BucketProps }) {
  return (
    <div className="member-main-section" data-testid="section-bucket">
      <div className="member-head" data-testid="member-head">
        {section.title_h2 && (
          <h2
            {...(section?.$?.title_h2 as unknown as object)}
            data-testid="section-title"
          >
            {section.title_h2}
          </h2>
        )}
        {section.description && (
          <p
            {...(section?.$?.description as unknown as object)}
            dangerouslySetInnerHTML={getMultilineHTML(section.description)}
            data-testid="section-description"
          ></p>
        )}
      </div>
      <div
        className="member-section"
        {...(section?.$?.["buckets"] || {})}
        data-testid="member-section"
      >
        {section.buckets?.map((bucket, idx) => (
          <div
            className="content-section"
            key={`content-section-${idx}`}
            {...(section?.$?.["buckets__" + idx] as unknown as object)}
            data-testid={`content-section-${idx}`}
          >
            {bucket.icon && (
              <img
                {...(bucket.icon?.$?.url as unknown as object)}
                src={bucket.icon?.url}
                alt="bucket icon"
                data-testid={`bucket-icon-${idx}`}
              />
            )}

            {bucket.title_h3 ? (
              <h3
                {...(bucket?.$?.title_h3 as unknown as object)}
                data-testid={`bucket-title-${idx}`}
              >
                {bucket.title_h3}
              </h3>
            ) : (
              ""
            )}
            <div
              {...(bucket?.$?.description as unknown as object)}
              data-testid={`bucket-description-${idx}`}
            >
              {bucket.description && parse(bucket.description)}
            </div>
            {bucket.call_to_action.title ? (
              <Link
                to={
                  bucket.call_to_action.href ? bucket.call_to_action.href : "#"
                }
                {...bucket.call_to_action?.$?.title}
                data-testid={`bucket-cta-${idx}`}
              >
                {`${bucket.call_to_action.title} -->`}
              </Link>
            ) : (
              ""
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
