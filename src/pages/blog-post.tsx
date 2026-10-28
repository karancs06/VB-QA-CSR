import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import moment from "moment";
import parse from "html-react-parser";

import ArchiveRelative from "../components/archive-relative";
import RenderComponents from "../components/render-components";
import { getPageRes, getBlogPostRes } from "../helper";
import Skeleton from "react-loading-skeleton";
import { Prop, Banner, Post } from "../typescript/pages";
import { useLivePreviewCtx } from "../context/live-preview-context-provider";
import { cslp } from "../utils/cslp";

export default function BlogPost({ entry }: Prop) {
  const lpTs = useLivePreviewCtx();
  const { blogId, locale } = useParams();
  const history = useNavigate();
  const [getEntry, setEntry] = useState({
    banner: {} as Banner,
    post: {} as Post,
  });
  const [error, setError] = useState(false);

  async function fetchData() {
    try {
      const entryUrl = blogId ? `/blog/${blogId}` : "/";
      const banner = await getPageRes("/blog", locale);
      const post = await getBlogPostRes(entryUrl, locale);
      if (!banner || !post) return;
      setEntry({ banner, post });
      entry({ page: banner, blogPost: post });
    } catch (error) {
      console.error(error);
      setError(true);
    }
  }

  useEffect(() => {
    fetchData();
    error && history("/404");
  }, [blogId, lpTs, error]);

  const { post, banner } = getEntry;
  return (
    <>
      {banner ? (
        <RenderComponents
          pageComponents={banner.page_components}
          blogsPage
          contentTypeUid="blog_post"
          entryUid={banner.uid}
          locale={banner.locale}
          data-testid="render-components"
        />
      ) : (
        <Skeleton height={400} data-testid="skeleton-banner" />
      )}

      <div className="blog-container" data-testid="blog-container">
        <article className="blog-detail" data-testid="blog-detail">
          {post.title ? (
            <h2 {...cslp(post?.$?.title)} data-testid="post-title">
              {post.title}
            </h2>
          ) : (
            <h2 data-testid="skeleton-title">
              <Skeleton />
            </h2>
          )}
          {post.date ? (
            <p {...cslp(post?.$?.date)} data-testid="post-date">
              {moment(post.date).format("ddd, MMM D YYYY")},{" "}
              {post.author && post.author[0] ? (
                <strong
                  {...cslp(post.author[0].$?.title)}
                  data-testid="post-author"
                >
                  {post.author[0].title}
                </strong>
              ) : null}
            </p>
          ) : (
            <p data-testid="skeleton-date">
              <Skeleton width={300} />
            </p>
          )}
          {post.body ? (
            <div {...cslp(post?.$?.body)} data-testid="post-body">
              {parse(post.body)}
            </div>
          ) : (
            <Skeleton height={800} width={600} data-testid="skeleton-body" />
          )}
          {post.taxonomies && (
            <div {...cslp(post?.$?.taxonomies)} data-testid="post-taxonomies">
              <strong>Region: </strong>
              {post.taxonomies.map(
                ({ term_uid }: { term_uid: string }, index: number) => (
                  <span
                    key={`taxonomy-${index}`}
                    style={{ textTransform: "capitalize" }}
                    data-testid={`taxonomy-${index}`}
                  >
                    {term_uid}
                  </span>
                ),
              )}
            </div>
          )}
        </article>
        <div className="blog-column-right" data-testid="blog-column-right">
          <div className="related-post" data-testid="related-post">
            {Object.keys(banner).length && banner.page_components[2].widget ? (
              <h2
                {...cslp(banner?.page_components[2].widget?.$?.title_h2)}
                data-testid="related-post-title"
              >
                {banner?.page_components[2].widget.title_h2}
              </h2>
            ) : (
              <h2 data-testid="skeleton-related-post-title">
                <Skeleton />
              </h2>
            )}
            {post.related_post ? (
              <ArchiveRelative
                {...cslp(post?.$?.related_post)}
                blogs={post.related_post}
                data-testid="archive-relative"
              />
            ) : (
              <Skeleton
                width={300}
                height={500}
                data-testid="skeleton-related-post"
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
