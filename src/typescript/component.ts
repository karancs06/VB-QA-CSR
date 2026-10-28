import type { AnchorHTMLAttributes, HTMLAttributes } from "react";
import { Action, Image, PresetImage } from "./action";

type CslpEditableMeta = {
  title: string;
  title_h2: string;
  title_h3: string;
  description: string;
  banner_title: string;
  banner_description: string;
  banner_image_custom: string;
  text_color: string;
  designation: string;
  name: string;
  html_code: string;
  body: string;
};

type Employee = {
  image: Image;
  name: string;
  designation: string;
  $: CslpEditableMeta;
};

type BucketList = [
  BucketArray: {
    title_h3: string;
    description: string;
    url: string;
    call_to_action: Action;
    icon: Image;
    $: CslpEditableMeta;
  },
];

/** Live-preview props spread onto card field nodes (e.g. data-cslp). */
export type SectionCardEditableProps = Partial<{
  title_h3: HTMLAttributes<HTMLHeadingElement>;
  description: HTMLAttributes<HTMLParagraphElement>;
  call_to_action: AnchorHTMLAttributes<HTMLAnchorElement>;
}>;

type Card = [
  cardArray: {
    title_h3: string;
    description: string;
    call_to_action: Action;
    $: SectionCardEditableProps;
  },
];

type Article = {
  href: string;
  title: string;
  $: CslpEditableMeta;
};

type FeaturedBlog = [
  BlogArray: {
    title: string;
    featured_image: Image;
    body: string;
    url: string;
    $: CslpEditableMeta;
  },
];

type Widget = {
  title_h2: string;
  type?: string;
  $: CslpEditableMeta;
};

export type Component = {
  hero_banner: Banner;
  section?: SectionProps;
  section_with_buckets?: SectionWithBucket;
  from_blog?: FeaturedBlogData;
  section_with_cards?: Cards;
  section_with_html_code?: ObjectProps;
  our_team?: TeamProps;
  widget?: Widget;
  section_with_multiple_images?: SectionWithMultipleImage;
};

export type SectionWithBucket = {
  bucket_tabular: boolean;
  title_h2: string;
  buckets: BucketList;
  description: string;
  $: CslpEditableMeta;
};

export type SectionWithMultipleImage = {
  file: Image[];
  $: {
    file: string;
    file__parent?: string;
  };
};

export type Cards = {
  cards: Card;
  $?: {
    [key: string]: {
      "data-cslp": string;
    };
  };
};

export type Banner = {
  banner_title: string;
  banner_description: string;
  bg_color: string;
  call_to_action: Action;
  banner_image: Image;
  banner_image_custom: PresetImage;
  text_color: string;
  $: CslpEditableMeta;
};

export type ObjectProps = {
  html_code_alignment: string;
  title: string;
  $: CslpEditableMeta;
  description: string;
  html_code: string;
};

export type SectionProps = {
  title_h2: string;
  description: string;
  call_to_action: Action;
  image: Image;
  image_alignment: string;
  $: CslpEditableMeta;
};

export type TeamProps = {
  title_h2: string;
  description: string;
  $: CslpEditableMeta;
  employees: [Employee];
};

export type FeaturedBlogData = {
  title_h2: string;
  view_articles: Article;
  featured_blogs: FeaturedBlog;
  $: CslpEditableMeta;
};

export type RenderProps = {
  pageComponentsCslp?: any;
  cslp?: Record<string, Record<string, string>>;
  blogsPage?: boolean;
  contentTypeUid: string;
  entryUid: string;
  locale: string;
  pageComponents: Component[];
};
