import { Image } from "./action";

type Object = {
    featured_blogs?: any
    banner_title?:string;
    banner_description?: string;
    url?: {};
    title: {};
    title_h2?: string;
    body: string;
    [key: string]: any;
  }

type Author = {
    title: string;
    $: Object;
  }

type Article = {
    href: string;
    title: string;
    $: Object;
  }
  
type FeaturedBlog = {
    title: string;
    featured_image: Image;
    body: string;
    url: string;
    $: Object;
  }

type FeaturedBlogData = {
    title_h2: string;
    view_articles: Article;
    featured_blogs: [FeaturedBlog]
    $: Object;
  }
  
export type BannerProps = {
    banner_title:string;
    banner_description: string;
    bg_color: string;
    $: Object;
  }

export type BloglistProps = {
    body: string;
    url: string;
    featured_image?: Image; 
    title: string;
    date?: string;
    author?: [Author];
    $: Object;
  }

export type FeaturedBlogProps = {
    blogs: FeaturedBlogData;
  }