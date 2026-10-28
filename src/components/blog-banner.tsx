import React from "react";
import { BannerProps } from "../typescript/blog";

export default function BlogBanner({
  blog_banner,
}: {
  blog_banner: BannerProps;
}) {
  return (
    <div
      className="blog-page-banner"
      style={{ background: `${blog_banner?.bg_color}` }}
      data-testid="blog-page-banner"
    >
      <div className="blog-page-content" data-testid="blog-page-content">
        {blog_banner.banner_title && (
          <h1
            {...(blog_banner?.$?.banner_title as {})}
            className="hero-title"
            data-testid="banner-title"
          >
            {blog_banner.banner_title}
          </h1>
        )}

        {blog_banner.banner_description &&
          (Array.isArray(blog_banner.banner_description) &&
          blog_banner.banner_description.length > 0 ? (
            <p
              {...(blog_banner?.$?.banner_description__0 as {})}
              className="hero-description"
              data-testid="banner-description-0"
            >
              {blog_banner.banner_description[0]}
            </p>
          ) : (
            <p
              {...(blog_banner?.$?.banner_description as {})}
              className="hero-description"
              data-testid="banner-description"
            >
              {blog_banner.banner_description}
            </p>
          ))}
      </div>
    </div>
  );
}
