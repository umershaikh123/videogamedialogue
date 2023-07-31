"use client";
import { useState, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/Auth";
import Image from "next/image";
import {
  CharacterItem,
  DashboardButton,
  Divider,
  SectionHeader,
  Sidebar,
  Spinner,
  SupportText,
} from "@/components";
import "../characterPage.css";
import { useEffect } from "react";
import { supabase } from "@/services/supabase";
import PlaceholderImage from "@/images/placeholder.png";
import { AddIcon, EditIcon, ExportIcon, TrashIcon } from "@/components/icons";
import styles from "./styles.module.css";

export default function CharacterPage({
  params,
}: {
  params: { character_id: string };
}) {
  const router = useRouter();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [fileUploadName, setFileUploadName] = useState("");
  const [fileUploadDescription, setFileUploadDescription] = useState("");
  const [character, setCharacter] = useState<Character | null>(null);
  const [clips, setClips] = useState<Clip[] | null>(null);

  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  if (!user) {
    return router.push("/login");
  }

  async function uploadAvatar(character_id: string) {
    try {
      setUploading(true);
      if (!imageFile) {
        throw new Error("You must select an image to upload.");
      }

      const file = imageFile;
      const filePath = `${user?.id}/${character_id}/profile.png`;

      const imageUrl = URL.createObjectURL(file);
      setAvatarUrl(imageUrl);

      let { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          upsert: true,
        });

      if (uploadError) {
        console.log(uploadError);
      }
    } catch (error) {
      alert(error);
    } finally {
      setUploading(false);
    }
  }

  const setPreviewImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      throw new Error("You must select an image to upload.");
    }

    const file = event.target.files[0];
    const imageUrl = URL.createObjectURL(file);
    setImageFile(file);
    setAvatarUrl(imageUrl);
  };

  const retreiveCharacterData = async () => {
    const { data, error } = await supabase
      .from("characters")
      .select("*")
      .eq("character_id", params.character_id)
      .single();
    if (error) {
      alert("Character not found");
      router.push("/");
      throw error;
    }

    let characterWithImage = data;

    try {
      const { data: image_data, error: image_error } = await supabase.storage
        .from("avatars")
        .download(`${user?.id}/${params.character_id}/profile.png`);
      if (image_error) {
        console.error(
          `Error retrieving image for character ${params.character_id}: ${image_error.message}`
        );
      } else {
        const blob = new Blob([image_data], { type: "image/png" });
        const imageUrl = URL.createObjectURL(blob);
        setAvatarUrl(imageUrl);

        characterWithImage = {
          ...data,
          image_url: imageUrl,
        };
      }
    } catch (error) {
      console.error(
        `Error retrieving image for character ${params.character_id}: ${error}`
      );
    }
    setIsLoading(false);
    setCharacter(characterWithImage);
    setFileUploadName(data.name);
    setFileUploadDescription(data.description);
  };

  function getTime(time: string) {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const date = new Date(time);
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    return `${day} ${monthNames[month]} ${year}`;
  }

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!character) return;
    setIsLoading(true);

    const { error } = await supabase
      .from("characters")
      .update({
        name: fileUploadName,
        description: fileUploadDescription,
      })
      .eq("character_id", character.character_id);
    if (error) {
      throw error;
    }
    if (imageFile) {
      const newPicture = await uploadAvatar(character.character_id);
    }

    alert("Character updated successfully");
    setIsLoading(false);
    router.push(`/character/${character.character_id}`);
  };

  const handleDelete = async () => {
    if (!character) return;

    const { error: clipError } = await supabase
      .from("clips")
      .delete()
      .eq("character_id", character?.character_id);
    if (clipError) {
      throw clipError;
    }

    const { error } = await supabase
      .from("characters")
      .delete()
      .eq("character_id", character?.character_id);
    if (error) {
      throw error;
    }

    alert("Character deleted successfully");
    router.push("/");
  };

  useEffect(() => {
    retreiveCharacterData();
  }, []);

  return (
    <>
      <Sidebar />
      <main className="main-wrapper">
        {character ? (
          <>
            <div className="characterHeader">
              <div className="page-header has-picture">
                {character.image_url ? (
                  <Image
                    alt="Character picture"
                    className="character-picture"
                    src={character.image_url}
                    width={40}
                    height={40}
                  />
                ) : (
                  <Image
                    alt="Character picture"
                    className="character-picture"
                    src={PlaceholderImage}
                    width={40}
                    height={40}
                  />
                )}
                <h2 className="heading-large">{character?.name}</h2>
              </div>
              <div className="buttons-wrapper">
                <button
                  className="button-secondary"
                  onClick={() =>
                    router.push(`/character/${character.character_id}`)
                  }
                >
                  <EditIcon width={20} height={20} />
                  Go back to clips
                </button>
              </div>
            </div>
            <section>
              <SectionHeader
                title="Character Info"
                helpText="Edit your character info."
              />
              <Divider top={20} bottom={24} />
              {isLoading ? (
                <Spinner />
              ) : (
                <form onSubmit={handleUpdate}>
                  <div className="step-content">
                    <SupportText name="Character Name" />
                    <input
                      className={styles.input}
                      type="text"
                      name="characterName"
                      placeholder="Emily"
                      onChange={(e) => setFileUploadName(e.target.value)}
                      value={fileUploadName}
                    />
                  </div>
                  <Divider top={20} bottom={20} />
                  <div className="step-content">
                    <SupportText name="Character Notes (optional)" />
                    <input
                      className={styles.input}
                      type="text"
                      name="characterNotes"
                      placeholder="NPC in region 1"
                      onChange={(e) => setFileUploadDescription(e.target.value)}
                      value={fileUploadDescription ? fileUploadDescription : ""}
                    />
                  </div>
                  <Divider top={20} bottom={20} />
                  <div className="step-content">
                    <SupportText name="Image" description="Minimum 40x40" />
                    <div className="avatar-upload-wrapper">
                      {avatarUrl ? (
                        <div className="avatar">
                          <Image
                            src={avatarUrl}
                            alt="Avatar"
                            width={200}
                            height={200}
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                      ) : (
                        <div className="avatar">
                          <Image
                            src={PlaceholderImage}
                            alt="Avatar"
                            width={200}
                            height={200}
                          />
                        </div>
                      )}
                      <label className="button primary block" htmlFor="single">
                        {uploading ? "Uploading ..." : "Upload"}
                      </label>
                      <input
                        style={{
                          visibility: "hidden",
                          position: "absolute",
                        }}
                        type="file"
                        id="single"
                        accept="image/*"
                        onChange={setPreviewImage}
                        disabled={uploading}
                      />
                    </div>
                  </div>
                  <Divider top={20} bottom={20} />
                  <div className="buttons-wrapper">
                    <button
                      className="button-destructive"
                      type="button"
                      onClick={() => handleDelete()}
                    >
                      Delete
                    </button>
                    <button className="button-primary" type="submit">
                      Save Character
                    </button>
                  </div>
                </form>
              )}
            </section>
          </>
        ) : (
          <Spinner />
        )}
      </main>
    </>
  );
}
