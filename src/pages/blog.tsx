import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ArchiveRelative from "../components/archive-relative";
import RenderComponents from "../components/render-components";
import BlogList from "../components/blog-list";
import { getBlogListRes, getPageRes } from "../helper";
import Skeleton from "react-loading-skeleton";
import {
  Prop,
  Entry,
  ArchiveBlogList,
  BlogData,
  Blog as BlogType,
} from "../typescript/pages";
import { useLivePreviewCtx } from "../context/live-preview-context-provider";

export default function Blog({ entry }: Prop) {
  const history = useNavigate();
  const [getEntry, setEntry] = useState({} as Entry);
  const [getList, setList] = useState({
    archive: {} as ArchiveBlogList,
    list: {} as BlogType[],
  });
  const [error, setError] = useState(false);
  const lpTs = useLivePreviewCtx();
  const { locale } = useParams();

  async function fetchData() {
    try {
      const blog = await getPageRes("/blog", locale);
      const result = await getBlogListRes(locale);
      if (!blog || !result) return;

      const archive = [] as any;
      const blogLists = [] as any;

      result.forEach((blogs: BlogData) => {
        if (blogs.is_archived) {
          archive.push(blogs);
        } else {
          blogLists.push(blogs);
        }
      });

      setEntry(blog);
      setList({ archive: archive, list: blogLists });
      entry({ page: blog, blogPost: result });
    } catch (error) {
      console.error(error);
      setError(true);
    }
  }

  useEffect(() => {
    fetchData();
    error && history("/404");
  }, [error, lpTs]);

  return (
    <>
      {Object.keys(getEntry).length ? (
        <RenderComponents
          pageComponents={getEntry.page_components}
          blogsPage
          contentTypeUid="page"
          entryUid={getEntry.uid}
          locale={getEntry.locale}
          data-testid="render-components"
        />
      ) : (
        <Skeleton height={400} data-testid="skeleton-render-components" />
      )}
      <div className="blog-container" data-testid="blog-container">
        <div className="blog-column-left" data-testid="blog-column-left">
          {Object.keys(getList.list).length ? (
            getList.list.map((bloglist, index) => (
              <BlogList
                bloglist={bloglist}
                key={`blog-column-left-${index}`}
                data-testid={`blog-list-${index}`}
              />
            ))
          ) : (
            <Skeleton
              height={400}
              width={400}
              count={3}
              data-testid="skeleton-blog-list"
            />
          )}
        </div>
        <div className="blog-column-right" data-testid="blog-column-right">
          {Object.keys(getEntry).length &&
          getEntry.page_components[1].widget ? (
            <h2
              {...(getEntry?.page_components[1].widget?.$?.title_h2 as {})}
              data-testid="widget-title"
            >
              {getEntry?.page_components[1].widget.title_h2}
            </h2>
          ) : (
            <h2 data-testid="skeleton-widget-title">
              <Skeleton />
            </h2>
          )}
          {Object.keys(getList.archive).length ? (
            <ArchiveRelative
              blogs={getList.archive}
              data-testid="archive-relative"
            />
          ) : (
            <Skeleton
              height={600}
              width={300}
              data-testid="skeleton-archive-relative"
            />
          )}
        </div>
      </div>
    </>
  );
}
