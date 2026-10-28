import { Image, Action, PresetImage } from "../typescript/action";

type Object = {
  banner_title: string;
  banner_description: string;
  text_color: string;
  banner_image_custom: string;
};
type MultipleText = {
  key: string;
};

type Banner = {
  bg_color: string;
  text_color: string;
  banner_title: string;
  banner_description: string | string[];
  call_to_action: Action;
  banner_image: Image | Image[];
  banner_image_custom: PresetImage;
  $: Object;
};

export type BannerProps = {
  hero_banner: Banner;
};
