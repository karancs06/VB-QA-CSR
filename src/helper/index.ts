import { addEditableTags } from "@contentstack/utils";
import Stack from "../sdk/entry";

const liveEdit = true;

export interface EntryModel {
  uid: string;
  _content_type_uid?: string;
  [propName: string]: any;
}

export interface EmbedModel<T> {
  [path: string]: T[];
}

export interface EntryEmbedable {
  uid: string;
  _embedded_items?: EmbedModel<EntryModel>;
  [propName: string]: any;
}

export const getHeaderRes = async (
  locale: string | null | undefined = null,
) => {
  const response = (await Stack.getEntry({
    contentTypeUid: "header",
    referenceFieldPath: ["navigation_menu.page_reference"],
    jsonRtePath: ["notification_bar.announcement_text"],
    locale,
  })) as any;
  const entry = response[0][0];
  liveEdit && addEditableTags(entry, "header", true, entry?.locale || locale);
  return entry;
};

export const getFooterRes = async (
  locale: string | null | undefined = null,
) => {
  const response = (await Stack.getEntry({
    contentTypeUid: "footer",
    jsonRtePath: ["copyright"],
    referenceFieldPath: undefined,
    locale,
  })) as any;
  const entry = response[0][0];
  liveEdit && addEditableTags(entry, "footer", true, entry?.locale || locale);
  return entry;
};

export const getAllEntries = async (
  locale: string | null | undefined = null,
) => {
  const response = (await Stack.getEntry({
    contentTypeUid: "page",
    jsonRtePath: undefined,
    referenceFieldPath: undefined,
    locale,
  })) as any;
  liveEdit &&
    response[0] &&
    response[0].forEach((entry: EntryModel) => {
      addEditableTags(entry, "page", true, entry?.locale || locale);
    });
  return response[0];
};

export const getPageRes = async (
  entryUrl: string,
  locale: string | null | undefined = null,
) => {
  const response = (await Stack.getEntryByUrl({
    contentTypeUid: "page",
    entryUrl,
    referenceFieldPath: ["page_components.from_blog.featured_blogs"],
    jsonRtePath: [
      "page_components.from_blog.featured_blogs.body",
      "page_components.section_with_buckets.buckets.description",
      "page_components.section_with_html_code.description",
    ],
    locale,
  })) as any;
  const searchParams = new URLSearchParams(window.location.search);
  const entry_uid = searchParams.get("entry_uid");
  let entry;
  if (response.length === 1) {
    entry = response[0];
  } else {
    entry = response.find((entry: EntryModel) => entry.uid === entry_uid);
  }

  liveEdit && addEditableTags(entry, "page", true, entry?.locale || locale);
  return entry;
};

export const getBlogListRes = async (
  locale: string | null | undefined = null,
) => {
  const response = (await Stack.getEntry({
    contentTypeUid: "blog_post",
    referenceFieldPath: ["author", "related_post"],
    jsonRtePath: ["body"],
    locale,
  })) as any;
  liveEdit &&
    response[0] &&
    response[0].forEach((entry: EntryModel) => {
      addEditableTags(entry, "blog_post", true, entry?.locale || locale);
    });
  return response[0];
};

export const getBlogPostRes = async (
  entryUrl: string,
  locale: string | null | undefined = null,
) => {
  const response = (await Stack.getEntryByUrl({
    contentTypeUid: "blog_post",
    entryUrl,
    referenceFieldPath: ["author", "related_post"],
    jsonRtePath: ["body", "related_post.body"],
    locale,
  })) as any;
  const entry = response[0];
  liveEdit &&
    addEditableTags(entry, "blog_post", true, entry?.locale || locale);
  return entry;
};

export const getMultilineHTML = (text: string) => {
  const elem = document.createElement("div");
  elem.innerText = text || "";
  return { __html: elem.innerHTML };
};
