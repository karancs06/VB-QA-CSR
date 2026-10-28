import React from "react";
import parse from "html-react-parser";
import { BucketProps, Bucket } from "../typescript/about-section-bucket";

export default function AboutSectionBucket({
  sectionWithBuckets,
}: {
  sectionWithBuckets: BucketProps;
}) {
  function bucketContent(bucket: Bucket, index: number) {
    return (
      <div
        className="mission-content-section"
        key={`about-section-bucket-${index}`}
        data-testid={`bucket-content-${index}`}
      >
        {bucket.icon && (
          <img
            {...(bucket.icon?.$?.url as unknown as object)}
            className="mission-icon"
            src={bucket.icon?.url}
            alt="art work"
            data-testid={`bucket-icon-${index}`}
          />
        )}

        <div
          className="mission-section-content"
          data-testid={`bucket-section-content-${index}`}
        >
          {bucket.title_h3 && (
            <h3
              {...(bucket?.$?.title_h3 as unknown as object)}
              data-testid={`bucket-title-${index}`}
            >
              {bucket.title_h3}
            </h3>
          )}
          <div
            {...(bucket?.$?.description as unknown as object)}
            data-testid={`bucket-description-${index}`}
          >
            {" "}
            {bucket.description && parse(bucket.description)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="member-main-section" data-testid="about-section-bucket">
      <div className="member-head" data-testid="member-head">
        {sectionWithBuckets.title_h2 && (
          <h2
            {...(sectionWithBuckets?.$?.title_h2 as unknown as object)}
            data-testid="section-title"
          >
            {sectionWithBuckets.title_h2}
          </h2>
        )}
      </div>
      <div className="mission-section" data-testid="mission-section">
        <div className="mission-content-top" data-testid="mission-content-top">
          {sectionWithBuckets.buckets.map(
            (bucket, index: number) =>
              index < 2 && bucketContent(bucket, index),
          )}
        </div>
        <div
          className="mission-content-bottom"
          data-testid="mission-content-bottom"
        >
          {sectionWithBuckets.buckets.map(
            (bucket, index: number) =>
              index >= 2 && bucketContent(bucket, index),
          )}
        </div>
      </div>
    </div>
  );
}
