import { Post } from "@/utils/supabase/types/object.types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import AssetDisplay from "./asset-display";
import { formatDistanceToNow } from "date-fns";

interface Props {
  post: Post;
}
export default function PostCard({ post }: Props) {
  const timeAgo = formatDistanceToNow(new Date(post.created_at!));

  return (
    <Card className="max-w-lg">
      <CardHeader className="flex justify-between">
        <div>
          <CardTitle className="mb-1 text-lg">{post.title}</CardTitle>
          <CardDescription>
            {timeAgo} ago by{" "}
            <span className="font-semibold">{post.profiles.username}</span>
          </CardDescription>
        </div>
        <Badge variant="default">{post.type}</Badge>
      </CardHeader>
      <CardContent className="text-sm">
        <p className="mb-6">{post.description}</p>
        <AssetDisplay
          url={post.asset_url}
          type={post.asset_type}
          name={post.title}
          className="max-h-[300px]"
        />
      </CardContent>
    </Card>
  );
}
