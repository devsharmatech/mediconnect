import { supabase } from "@/lib/supabaseAdmin";

export async function uploadProfilePicture(file, userId, oldUrl) {
  if (!file) return oldUrl;

  const fileName = `${userId}-${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from("profile_pictures")
    .upload(fileName, file, { upsert: true });

  if (error) throw new Error("Failed to upload image");

  // Delete old image if exists
  if (oldUrl) {
    const oldPath = oldUrl.split("/").pop();
    await supabase.storage.from("profile_pictures").remove([oldPath]);
  }

  const { data: publicUrl } = supabase
    .storage
    .from("profile_pictures")
    .getPublicUrl(fileName);

  return publicUrl.publicUrl;
}
