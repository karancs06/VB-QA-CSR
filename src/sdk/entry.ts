/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-undef */
import contentstack from "contentstack";
import * as Utils from "@contentstack/utils";
import config from "../config";
import ContentstackLivePreview from "@contentstack/live-preview-utils";

type GetEntry = {
  contentTypeUid: string;
  referenceFieldPath: string[] | undefined;
  jsonRtePath: string[] | undefined;
  locale?: string | null;
};

type GetEntryByUrl = {
  entryUrl: string | undefined;
  contentTypeUid: string;
  referenceFieldPath: string[] | undefined;
  jsonRtePath: string[] | undefined;
  locale?: string | null;
  includeAll?: boolean;
};

export type ReferenceCondition = {
  refField: string;
  conditions: Record<string, any>;
};

type GetEntryByField = {
  contentTypeUid: string;
  field: string;
  value: string;
  include?: string[];
  referenceConditions?: ReferenceCondition[];
  locale?: string | null;
};

const previewApiUrl = ((config.API_HOST as string) || "")
  .replace("cdn", "rest-preview")
  .replace(".io", ".com");

// Visual Builder propagates the active CS branch into the iframe URL as the
// `branch` query param (see VB-1819). Scope the delivery Stack to that branch
// so content is fetched from the selected (incl. non-default/feature) branch.
// Falls back to the configured default when the param is absent (e.g.
// standalone browsing).
export const currentBranch =
  new URLSearchParams(window.location.search).get("branch") ||
  config.BRANCH ||
  "main";

export const Stack = contentstack.Stack({
  api_key: `${config.API_KEY}`,
  delivery_token: `${config.DELIVERY_TOKEN}`,
  environment: `${config.ENVIRONMENT}`,
  branch: currentBranch,
  live_preview: {
    preview_token: `${config.PREVIEW_TOKEN}` ? `${config.PREVIEW_TOKEN}` : "",
    enable: true,
    host: `${previewApiUrl}` ? `${previewApiUrl}` : "",
  },
});

/**
 * initialize live preview
 */

const appURL = new URL(config.APP_HOST);

const VALID_START_EDITING_POSITIONS = [
  "bottom-right",
  "bottom-left",
  "top-left",
  "top-right",
] as const;

const csrPageSearchParams = new URLSearchParams(window.location.search);
const startEditingEnableParam = csrPageSearchParams.get("start-editing-enable");
const startEditingPositionParam = csrPageSearchParams.get(
  "start-editing-position",
);

const isStartEditingEnabled = startEditingEnableParam !== "false";
const startEditingPosition = (
  VALID_START_EDITING_POSITIONS.includes(
    startEditingPositionParam as (typeof VALID_START_EDITING_POSITIONS)[number],
  )
    ? startEditingPositionParam
    : "bottom-right"
) as (typeof VALID_START_EDITING_POSITIONS)[number];
const overlayPropagationEnabled =
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).get("overlayPropagation") ===
    "true";

ContentstackLivePreview.init({
  enable: true,
  mode: "builder",
  //@ts-ignore
  stackSdk: Stack,
  clientUrlParams: {
    host: appURL.hostname,
    port: appURL.port,
    protocol: appURL.protocol.split(":")[0] as "http" | "https",
  },
  stackDetails: {
    apiKey: config.API_KEY,
  },
  // QA (VP-2701): Live Preview edit tag always on; the SDK only draws it in LP windows, not in VB.
  editButton: {
    enable: true,
  },
  editInVisualBuilderButton: {
    enable: isStartEditingEnabled,
    ...(startEditingPosition && { position: startEditingPosition }),
  },
  // @ts-ignore — overlayPropagation lands in @contentstack/live-preview-utils types after rebuild
  overlayPropagation: {
    enable: overlayPropagationEnabled,
  },
  ssr: false,
});

if (config.API_HOST) {
  Stack.setHost(config.API_HOST);
}

const renderOption = {
  span: (node: any, next: any) => {
    return next(node.children);
  },
};

export const onEntryChange = ContentstackLivePreview.onEntryChange;
// setPageContext exists on the full ContentstackLivePreview class (not LightLivePreviewHoC)
// but the CSR site always initialises with mode:"builder" so the full class is used at runtime.
export const setPageContext = (ContentstackLivePreview as any)
  .setPageContext as (context: {
  entryUid: string;
  contentTypeUid: string;
}) => void;

export default {
  /**
   * Fetches entries from a content type where a specific flat field matches a value.
   * Used by the custom URL resolver to look up entries by slug fields.
   */
  getEntryByField({
    contentTypeUid,
    field,
    value,
    include,
    referenceConditions,
    locale,
  }: GetEntryByField) {
    return new Promise<any[]>((resolve, reject) => {
      const query = Stack.ContentType(contentTypeUid).Query();
      if (include?.length) query.includeReference(include);
      if (locale) query.language(locale);
      referenceConditions?.forEach(({ refField, conditions }) => {
        // @ts-ignore
        query.referenceIn(refField, conditions);
      });
      query
        .addQuery("include_applied_variants", "true")
        .includeFallback()
        .toJSON()
        // @ts-ignore
        .where(field, value)
        .find()
        .then(
          (result: any) => {
            resolve((result[0] as any[]) ?? []);
          },
          (error: any) => {
            reject(error);
          },
        );
    });
  },
  /**
   *
   * fetches all the entries from specific content-type
   * @param {* content-type uid} contentTypeUid
   * @param {* reference field name} referenceFieldPath
   * @param {* Json RTE path} jsonRtePath
   *
   */
  getEntry({
    contentTypeUid,
    referenceFieldPath,
    jsonRtePath,
    locale,
  }: GetEntry) {
    return new Promise((resolve, reject) => {
      const query = Stack.ContentType(contentTypeUid).Query();
      if (referenceFieldPath) query.includeReference(referenceFieldPath);
      if (locale) query.language(locale);
      query
        // .includeOwner()
        //.includeContentType()
        .includeFallback()
        .toJSON()
        .find()
        .then(
          (result) => {
            jsonRtePath &&
              Utils.jsonToHTML({
                entry: result,
                paths: jsonRtePath,
                renderOption,
              });
            resolve(result);
          },
          (error) => {
            reject(error);
          },
        );
    });
  },

  /**
   *fetches specific entry from a content-type
   *
   * @param {* content-type uid} contentTypeUid
   * @param {* url for entry to be fetched} entryUrl
   * @param {* reference field name} referenceFieldPath
   * @param {* Json RTE path} jsonRtePath
   * @returns
   */
  getEntryByUrl({
    contentTypeUid,
    entryUrl,
    referenceFieldPath,
    jsonRtePath,
    locale,
    includeAll = false,
  }: GetEntryByUrl) {
    return new Promise((resolve, reject) => {
      const blogQuery = Stack.ContentType(contentTypeUid).Query();
      if (referenceFieldPath) blogQuery.includeReference(referenceFieldPath);
      if (locale) blogQuery.language(locale);
      if (includeAll) {
        blogQuery.addQuery("include_all", "true");
        blogQuery.addQuery("include_all_depth", "2");
      }
      blogQuery
        .addQuery("include_applied_variants", "true")
        .includeFallback()
        .toJSON();
      const data = blogQuery.where("url", `${entryUrl}`).find();
      data.then(
        (result) => {
          jsonRtePath &&
            Utils.jsonToHTML({
              entry: result,
              paths: jsonRtePath,
              renderOption,
            });
          resolve(result[0]);
        },
        (error) => {
          reject(error);
        },
      );
    });
  },
};
