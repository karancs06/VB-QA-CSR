import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import moment from "moment";
import parse from "html-react-parser";
import { isVisualEditorEditing } from "@contentstack/live-preview-utils";
import { useLivePreviewCtx } from "../context/live-preview-context-provider";
import { getBlogListRes } from "../helper";
import "../styles/animation.scss";

/**
 * Demo page for VB-1994 / VB-2055 — "handling the continuous data change of a website".
 *
 * Reproduces the customer scenario with real content: the same blog_post entries
 * the /blog page uses, rendered as a continuously scrolling feed. The scroll is a
 * CSS animation on the track, and each blog title/body is editable in Visual
 * Builder.
 *
 * When an author selects/edits an element, the Live Preview SDK sets the attribute
 * `data-cslp-field-type` on that element (added on focus, removed on blur). This
 * attribute already ships in current and older SDK versions, so keying off it needs
 * no SDK upgrade. Because the scroll animation lives on the track (an ancestor of the
 * edited title), we use the "parent-driven motion" pattern: watch for the attribute
 * anywhere in the feed and pause the track while it is present.
 */
const SLIDE_INTERVAL_MS = 3000;
const EDITING_POLL_MS = 200;

/**
 * One example of consuming the SDK's `isVisualEditorEditing` check on our side:
 * poll it on a light interval and expose whether a field inside `ref` is being
 * edited. The SDK only provides the boolean check; how to read it (interval,
 * animation loop, etc.) is our choice.
 */
function useVisualEditorEditingPaused<T extends HTMLElement>(
  ref: React.RefObject<T>,
): boolean {
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const id = window.setInterval(() => {
      setPaused(isVisualEditorEditing(ref.current));
    }, EDITING_POLL_MS);
    return () => window.clearInterval(id);
  }, [ref]);
  return paused;
}

type Blog = {
  $?: Record<string, any>;
  uid: string;
  title: string;
  url: string;
  body?: string;
  date?: string;
  featured_image?: { url: string };
  author?: { title: string; $?: Record<string, any> }[];
};

export default function AnimationPage() {
  const lpTs = useLivePreviewCtx();
  const { locale } = useParams();
  const [blogs, setBlogs] = useState<Blog[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await getBlogListRes(locale ?? "en-us");
      if (!cancelled && Array.isArray(result)) setBlogs(result as Blog[]);
    })();
    return () => {
      cancelled = true;
    };
  }, [lpTs, locale]);

  return (
    <div className="animation-page" data-testid="animation-page">
      <header className="animation-page__intro">
        <h1>Continuous data change — Visual Editor demo</h1>
        <p>
          The content below changes on its own: a slideshow that advances every 3
          seconds and a feed that scrolls continuously. In Visual Editor, click a
          title or excerpt to edit it — the motion freezes while you edit and
          resumes when you click away, so the edit form stops resyncing.
        </p>
      </header>
      {blogs ? (
        <>
          <section className="animation-section">
            <h2 className="animation-section__label">
              Slideshow · advances every 3s
            </h2>
            <Slideshow blogs={blogs.slice(0, 5)} />
          </section>

          <section className="animation-section">
            <h2 className="animation-section__label">
              Continuously scrolling feed
            </h2>
            <BlogScroller blogs={blogs} />
          </section>
        </>
      ) : (
        <p className="animation-page__loading">Loading blogs…</p>
      )}
    </div>
  );
}

function Slideshow({ blogs }: { blogs: Blog[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // Pause auto-advance while a slide in this slideshow is being edited. The timer
  // reads the state through a ref so it never captures a stale value.
  const paused = useVisualEditorEditingPaused(rootRef);
  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    if (blogs.length <= 1) return;
    const id = window.setInterval(() => {
      if (pausedRef.current) return; // hold on the current slide while editing
      setActive((curr) => (curr + 1) % blogs.length);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [blogs.length]);

  return (
    <div className="slideshow" data-testid="slideshow" ref={rootRef}>
      <div
        className="slideshow__track"
        style={{ transform: `translateX(-${active * 100}%)` }}
      >
        {blogs.map((blog, index) => (
          <div className="slideshow__slide" key={index}>
            {blog.featured_image?.url && (
              <img
                className="slideshow__img"
                src={blog.featured_image.url}
                alt=""
              />
            )}
            <div className="slideshow__caption">
              <h3
                className="slideshow__title"
                {...((blog.$?.title as object) ?? {})}
              >
                {blog.title}
              </h3>
              {blog.date && (
                <span
                  className="slideshow__date"
                  {...((blog.$?.date as object) ?? {})}
                >
                  {moment(blog.date).format("MMM D, YYYY")}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="slideshow__dots">
        {blogs.map((_, index) => (
          <button
            key={index}
            type="button"
            className={
              index === active
                ? "slideshow__dot slideshow__dot--active"
                : "slideshow__dot"
            }
            onClick={() => setActive(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      <span className="slideshow__status" data-testid="slideshow-status">
        {paused ? "Paused (editing)" : "Playing"}
      </span>
    </div>
  );
}

function BlogScroller({ blogs }: { blogs: Blog[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);

  // Parent-driven motion: the scroll animation is on the track, but the author
  // edits a child (a title/excerpt). Ask the SDK whether an edit is active inside
  // the feed and pause the track while it is.
  const paused = useVisualEditorEditingPaused(viewportRef);

  // Duplicate the list so the vertical scroll can loop seamlessly. The clones are
  // decorative only: no edit tags and hidden from assistive tech.
  return (
    <div className="blog-scroller" data-testid="blog-scroller" ref={viewportRef}>
      <div
        className={
          paused ? "blog-scroller__track paused" : "blog-scroller__track"
        }
      >
        {blogs.map((blog, index) => (
          <BlogCard key={`real-${index}`} blog={blog} editable />
        ))}
        {blogs.map((blog, index) => (
          <BlogCard key={`clone-${index}`} blog={blog} editable={false} />
        ))}
      </div>
      <span className="blog-scroller__status" data-testid="blog-scroller-status">
        {paused ? "Paused (editing)" : "Scrolling"}
      </span>
    </div>
  );
}

function BlogCard({ blog, editable }: { blog: Blog; editable: boolean }) {
  // Only the real cards carry edit tags; clones are visual filler for the loop.
  const tag = (path: string): object =>
    (editable ? (blog.$?.[path] as object) : undefined) ?? {};

  const excerpt =
    typeof blog.body === "string" ? `${blog.body.slice(0, 220)}…` : "";

  return (
    <article
      className="blog-card"
      data-testid="blog-card"
      aria-hidden={editable ? undefined : true}
    >
      {blog.featured_image?.url && (
        <img
          className="blog-card__img"
          src={blog.featured_image.url}
          alt=""
        />
      )}
      <div className="blog-card__content">
        <h3 className="blog-card__title" {...tag("title")}>
          {blog.title}
        </h3>
        <p className="blog-card__meta">
          {blog.date && (
            <span {...tag("date")}>{moment(blog.date).format("MMM D, YYYY")}</span>
          )}
          {blog.author?.[0]?.title && (
            <>
              {" · "}
              <strong
                {...((editable ? (blog.author[0].$?.title as object) : undefined) ??
                  {})}
              >
                {blog.author[0].title}
              </strong>
            </>
          )}
        </p>
        <div className="blog-card__body" {...tag("body")}>
          {excerpt && parse(excerpt)}
        </div>
      </div>
    </article>
  );
}
