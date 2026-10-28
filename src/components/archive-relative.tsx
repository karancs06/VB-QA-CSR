import React from "react";
import { Link } from "react-router-dom";
import parse from "html-react-parser";
import { BlogListProps } from "../typescript/archive-relative";

export default function ArchiveRelative({ blogs, ...cslpProps }: BlogListProps) {
  return (
    <div {...cslpProps}>
      {blogs?.map((blog, index) => (
        <Link
          {...(blog?.$?.url as {})}
          to={blog.url}
          key={`archive-relative-${index}`}
          data-testid={`archive-relative-link-${index}`}
        >
          <h4
            {...(blog?.$?.title as {})}
            data-testid={`archive-relative-title-${index}`}
          >
            {blog.title}
          </h4>
          {blog.body && (
            <div
              {...(blog?.$?.body as {})}
              data-testid={`archive-relative-body-${index}`}
            >
              {parse(blog.body.slice(0, 80))}
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}
