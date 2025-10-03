import Image from "next/image";
import Video from "./video";
import clsx from "clsx";

interface Props {
  url: string;
  type: string;
  name: string;
  className?: string;
}
export default function AssetDisplay({ url, type, name, className }: Props) {
  if (type === "image") {
    return (
      <Image
        src={url}
        alt={`${name} image`}
        width={1000}
        height={1000}
        className={clsx("w-full h-auto object-cover rounded-md", className)}
      />
    );
  }

  if (type === "video") {
    return <Video url={url} className={className} />;
  }

  return null;
}
