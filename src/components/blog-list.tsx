import React from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import parse from "html-react-parser";
import { BloglistProps } from "../typescript/blog";

function BlogList({ bloglist }: { bloglist: BloglistProps }) {
  let body =
    (typeof bloglist.body === "string" && bloglist.body.substr(0, 300)) || "";
  const stringLength = (body as string).lastIndexOf(" ");
  body = `${(body as string).substr(
    0,
    Math.min((body as string).length, stringLength),
  )}...`;
  return (
    <div className="blog-list" data-testid="blog-list">
      {bloglist.featured_image && (
        <Link
          {...(bloglist.$?.url as {})}
          to={bloglist.url}
          data-testid="blog-list-link-featured-image"
        >
          <img
            {...(bloglist.$?.featured_image as {})}
            className="blog-list-img"
            src={bloglist.featured_image.url}
            alt="blog img"
            data-testid="blog-list-img"
          />
        </Link>
      )}
      <div className="blog-content" data-testid="blog-content">
        {bloglist.title && (
          <Link
            {...(bloglist.$?.url as {})}
            to={bloglist.url}
            data-testid="blog-list-link-title"
          >
            <h3 {...(bloglist.$?.title as {})} data-testid="blog-list-title">
              {bloglist.title}
            </h3>
          </Link>
        )}
        <p data-testid="blog-list-date-author">
          {bloglist.date && (
            <span {...(bloglist.$?.date as {})} data-testid="blog-list-date">
              {moment(bloglist.date).format("ddd, MMM D YYYY")},{" "}
            </span>
          )}
          {bloglist.author && bloglist.author.length ? (
            <strong
              {...(bloglist.author[0].$?.title as {})}
              data-testid="blog-list-author"
            >
              {bloglist.author[0].title}
            </strong>
          ) : (
            ""
          )}
        </p>
        <p {...(bloglist.$?.body as {})} data-testid="blog-list-body">
          {parse(body)}
        </p>
        {bloglist.url ? (
          <Link
            {...(bloglist.$?.url as {})}
            to={bloglist.url}
            data-testid="blog-list-link-read-more"
          >
            <span>{"Read more -->"}</span>
          </Link>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}

export default BlogList;
