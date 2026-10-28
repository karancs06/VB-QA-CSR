import { Component } from "../typescript/component";
import { Image } from "./action";

type Object = {
    taxonomies?: {};
    title: string;
    body: string;
    date: string;
    url: string;
    related_post: [];
    banner_title?: string;
    banner_description?: string;
    title_h2?: string;
    [key: string]: any;
  }

type Author = {
    title: string;
    $: Object;
  }

export type Blog = {
    url: string;
    body: string;
    title: string;
    featured_image?: Image;
    date?: string;
    author?: [Author];
    $: Object;
  }

export type PageEntry = {
    $: any;
    url: string;
    page_components: Component[];
    uid: string;
    locale: string;
  }
  
export type Prop = {
    entry: Function
  }
  
export type Entry = {
    uid: string;
    page_components: Component[];
    locale: string;
  };
  
export type BlogData = {
    is_archived: boolean;
  }
  
export type ArchiveBlogList = Blog[]

export type Banner = {
    uid: string;
    page_components:Component[];
    locale: string;
  }

export type Post = {
    url: string;
    page_components:[];
    title: string;
    date:string;
    author:Author[];
    body:string;
    related_post:[Blog];
    taxonomies?:any;
    $:Object;
  }