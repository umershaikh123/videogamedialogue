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

  if (!user) {
    return router.push("/login");
  }

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
    console.log(data);
    setIsLoading(false);
    setCharacter(data);
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

    alert("Character updated successfully");
    router.push(`/character/${character.character_id}}`);
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
                <Image
                  alt="Character"
                  src={PlaceholderImage}
                  width={40}
                  height={40}
                  className="character-picture"
                />
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
            </section>
          </>
        ) : (
          <Spinner />
        )}
      </main>
    </>
  );
}
