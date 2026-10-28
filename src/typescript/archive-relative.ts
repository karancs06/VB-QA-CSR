import { ArchiveBlogList } from "./pages";
  
export type BlogListProps = {
    blogs: ArchiveBlogList;
    // Live Preview edit-tag attributes for the `related_post` reference field,
    // spread from the parent via `cslp(post?.$?.related_post)`.
    "data-cslp"?: string;
    "data-cslp-parent-field"?: string;
    "data-testid"?: string;
  }