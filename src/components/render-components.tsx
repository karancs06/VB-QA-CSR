import React from "react";

import Section from "./section";
import HeroBanner from "./hero-banner";
import BlogBanner from "./blog-banner";
import CardSection from "./card-section";
import TeamSection from "./team-section";
import BlogSection from "./blog-section";
import SectionBucket from "./section-bucket";
import AboutSectionBucket from "./about-section-bucket";
import SectionWithHtmlCode from "./section-with-html-code";
import { Component, RenderProps } from "../typescript/component";
import SectionWithMultipleImages from "./section-with-multiple-images";

export default function RenderComponents(props: RenderProps) {
  const { pageComponents, blogsPage, contentTypeUid, entryUid, locale } = props;
  return (
    <div
      {...(props.cslp?.page_components || {})}
      className={
        pageComponents?.length
          ? "main-content"
          : // TODO when exporting this className from SDK, remember max-height
            // which also used to get applied form the SDK.
            "visual-builder__empty-block-parent max-height"
      }
      data-testid="render-components"
    >
      {pageComponents?.map((component, key: number) => (
        <div
          key={`component-${key}`}
          {...props.cslp?.["page_components__" + key]}
          data-testid={`page-component-${key}`}
        >
          <Sections component={component} blogsPage={blogsPage} />
        </div>
      ))}
    </div>
  );
}

const Sections = (props: { component: Component; blogsPage?: boolean }) => {
  const { component, blogsPage } = props;
  if (component.hero_banner) {
    return blogsPage ? (
      <BlogBanner
        blog_banner={component.hero_banner}
        data-testid="blog-banner"
      />
    ) : (
      <HeroBanner
        hero_banner={component.hero_banner}
        data-testid="hero-banner"
      />
    );
  }
  if (component.section) {
    return <Section section={component.section} data-testid="section" />;
  }
  if (component.section_with_buckets) {
    return component.section_with_buckets.bucket_tabular ? (
      <AboutSectionBucket
        sectionWithBuckets={component.section_with_buckets}
        data-testid="about-section-bucket"
      />
    ) : (
      <SectionBucket
        section={component.section_with_buckets}
        data-testid="section-bucket"
      />
    );
  }
  if (component.from_blog) {
    return (
      <BlogSection blogs={component.from_blog} data-testid="blog-section" />
    );
  }
  if (component.section_with_cards) {
    return (
      <CardSection
        dataCslp={component?.section_with_cards?.$}
        cards={component.section_with_cards.cards}
        data-testid="card-section"
      />
    );
  }
  if (component.section_with_html_code) {
    return (
      <SectionWithHtmlCode
        embedObject={component.section_with_html_code}
        data-testid="section-with-html-code"
      />
    );
  }
  if (component.our_team) {
    return (
      <TeamSection ourTeam={component.our_team} data-testid="team-section" />
    );
  }
  if (component.section_with_multiple_images) {
    return (
      <SectionWithMultipleImages
        section={component.section_with_multiple_images}
        data-testid="section-with-multiple-images"
      />
    );
  }
  return <></>;
};
