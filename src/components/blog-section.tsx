import React from "react";
import { Link } from "react-router-dom";
import parse from "html-react-parser";
import { FeaturedBlogProps } from "../typescript/blog";

export default function BlogSection(props: FeaturedBlogProps) {
  const fromBlog = props.blogs;
  return (
    <div className="community-section" data-testid="community-section">
      <div className="community-head" data-testid="community-head">
        {fromBlog.title_h2 && (
          <h2 {...(fromBlog?.$?.title_h2 as {})} data-testid="title-h2">
            {fromBlog.title_h2}
          </h2>
        )}
        {fromBlog.view_articles && (
          <Link
            to={fromBlog.view_articles.href}
            className="btn secondary-btn article-btn"
            {...fromBlog.view_articles?.$?.title}
            data-testid="view-articles"
          >
            {fromBlog.view_articles.title}
          </Link>
        )}
      </div>
      <div
        className="home-featured-blogs"
        {...(fromBlog?.$?.featured_blogs || {})}
        data-testid="home-featured-blogs"
      >
        {fromBlog.featured_blogs.map((blog, index) => (
          <div
            className="featured-blog"
            key={`featured-blogs-${index}`}
            {...fromBlog?.$?.["featured_blogs__" + index]}
            data-testid={`featured-blog-${index}`}
          >
            {blog.featured_image && (
              <img
                src={blog.featured_image.url}
                alt={blog.featured_image.filename}
                className="blog-post-img"
                {...(blog.featured_image?.$?.url as {})}
                data-testid={`featured-image-${index}`}
              />
            )}
            <div
              className="featured-content"
              data-testid={`featured-content-${index}`}
            >
              {blog.title && (
                <h3 {...blog?.$?.title} data-testid={`blog-title-${index}`}>
                  {blog.title}
                </h3>
              )}
              <div
                {...(blog?.$?.body as {})}
                data-testid={`blog-body-${index}`}
              >
                {blog.body && parse(blog.body.slice(0, 300))}
              </div>
              {blog.url && (
                <Link
                  {...blog.$?.url}
                  to={blog.url}
                  className="blogpost-readmore"
                  data-testid={`blog-readmore-${index}`}
                >
                  {"Read More -->"}
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
