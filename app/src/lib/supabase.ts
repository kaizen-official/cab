import {createClient} from '@supabase/supabase-js';
import {Platform} from 'react-native';

const SUPABASE_URL = 'https://ojyguoznzmzvtpxldcsx.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qeWd1b3puem16dnRweGxkY3N4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MjIzNjksImV4cCI6MjA4MjQ5ODM2OX0.vxBZ6lcdAQunxjJEwidj-K6I39o6bx8LSd50snt2HE0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function uploadToSupabase(
  bucket: string,
  fileUri: string,
  fileName: string,
  mimeType: string,
  pathPrefix: string,
): Promise<string> {
  const ext = fileName.split('.').pop() || 'jpg';
  const path = `${pathPrefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const response = await fetch(fileUri);
  const blob = await response.blob();

  const {error} = await supabase.storage.from(bucket).upload(path, blob, {
    contentType: mimeType,
    upsert: false,
  });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const {data} = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
