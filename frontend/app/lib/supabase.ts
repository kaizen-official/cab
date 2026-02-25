import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ojyguoznzmzvtpxldcsx.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qeWd1b3puem16dnRweGxkY3N4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MjIzNjksImV4cCI6MjA4MjQ5ODM2OX0.vxBZ6lcdAQunxjJEwidj-K6I39o6bx8LSd50snt2HE0";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function uploadToSupabase(
  bucket: string,
  file: File,
  pathPrefix: string,
): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${pathPrefix}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
