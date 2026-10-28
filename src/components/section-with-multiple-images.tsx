import { SectionWithMultipleImage } from "../typescript/component";
import { Image } from "../typescript/action";

export default function SectionWithMultipleImages(props: {
  section: SectionWithMultipleImage;
}) {
  const files = props?.section?.file || [];
  return (
    <div
      {...(props?.section?.$?.file as {})}
      style={{ margin: "20px" }}
      data-testid="section-with-multiple-images"
    >
      {files.map((file: Image, index: number) => (
        <img
          src={file.url}
          alt={file.filename}
          className="blog-post-img"
          {...(file?.$?.url as {})}
          style={{ maxHeight: "100px" }}
          key={`image-${index}`}
          data-testid={`image-${index}`}
        />
      ))}
    </div>
  );
}
