import { supabase } from "./supabase";
import { useAuth } from "@/hooks/Auth";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

const retreiveListOfCharacters = async () => {
  const { user } = useAuth();

  const { data, error } = await supabase
    .from("characters")
    .select("*")
    .eq("user_id", user?.id);
  if (error) {
    throw error;
  }
  console.log(data);
  return data;
};

const uploadVoice = async (
  name: string,
  description: string,
  files: File[],
  user_id: any
) => {
  const folderPath = user_id;
  const fileId = uuidv4();
  const fileExtension = files[0].name.split(".").pop();
  const fileName = `${fileId}.${fileExtension}`;

  var elevenLabsAnswer;

  const { error } = await supabase.storage
    .from("characters")
    .upload(`${folderPath}/${fileName}`, files[0]);

  if (error) {
    alert("Error uploading to our database. Please try again.");
    console.error(error);
    return null;
  }

  try {
    const apiEndpoint = "https://api.elevenlabs.io/v1/voices/add";
    const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
    const formData = new FormData();
    formData.append("name", name + `(${fileId})`);
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await axios.post(apiEndpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "xi-api-key": `${apiKey}`,
      },
    });

    elevenLabsAnswer = response.data.voice_id;
  } catch (error) {
    console.error(error);
    elevenLabsAnswer = null;
  }

  if (elevenLabsAnswer != null) {
    const { error: profileError } = await supabase.from("characters").insert({
      user_id: user_id,
      name: name,
      description: description,
      character_id: fileId,
      base_extension: fileExtension,
      elevenlabs_id: elevenLabsAnswer,
    });
    if (profileError) {
      alert("Error uploading to our character database. Please try again.");
      console.error(profileError);
      return null;
    }
  }

  return [elevenLabsAnswer, fileId];
};

export { retreiveListOfCharacters, uploadVoice };
