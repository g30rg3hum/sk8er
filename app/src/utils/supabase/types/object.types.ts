import { Tables } from "./database.types";

export type Post = Tables<"posts"> & { profiles: { username: string } };
