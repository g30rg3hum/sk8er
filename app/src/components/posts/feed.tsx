// need to get all posts
// display inside the cards for now.
// TODO: figure out system to see which posts to actually show.

import { createClient } from "@/utils/supabase/server";
import PostCard from "./post-card";
import { Post } from "@/utils/supabase/types/object.types";

export default async function Feed() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("posts")
    .select(`*, profiles (username)`)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 p-6">
      {posts &&
        posts.map((post: Post) => <PostCard key={post.id} post={post} />)}
    </div>
  );
}
