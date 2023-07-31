"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/Auth";
import Image from "next/image";
import {
  CharacterItem,
  ClipPlayer,
  DashboardButton,
  Divider,
  SectionHeader,
  Sidebar,
  Spinner,
} from "@/components";
import { AddIcon, ExportIcon } from "@/components/icons";
import styles from "./styles.module.css";
import { retreiveListOfCharacters } from "@/services/API";
import { useEffect } from "react";
import { supabase } from "@/services/supabase";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { SupportText } from "@/components";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  if (!user) {
    return router.push("/login");
  }

  const retreiveCharacterData = async () => {
    const { data, error } = await supabase
      .from("characters")
      .select("*")
      .eq("user_id", user?.id);
    if (error) {
      throw error;
    }
    console.log(data);
    setIsLoading(false);
    setCharacters(data);
  };

  useEffect(() => {
    retreiveCharacterData();
  }, []);

  return (
    <>
      <Sidebar />
      <main className="main-wrapper">
        <div className="page-header-buttons">
          <div className="page-header">
            <h2 className="heading-large">Dashboard</h2>
          </div>
        </div>
        <section>
          <SectionHeader title="Start creating audio" />
          <Divider top={20} bottom={24} />
          <div className={styles.startCreatingGrid}>
            <DashboardButton
              title="Create a new character"
              description="Add a new character and customize their voice"
              href="/new-character"
              icon={<AddIcon width={20} height={20} />}
            />
            <DashboardButton
              title="Create a new audio clip"
              description="Generate a new audio clip using an existing character"
              href="/new-clip"
              icon={<AddIcon width={20} height={20} />}
            />
          </div>
        </section>
        <section>
          <SectionHeader title="Characters" />
          <Divider top={20} bottom={24} />
          <div className={styles.characterList}>
            {isLoading ? (
              <Spinner />
            ) : (
              characters.map((character, index) => (
                <CharacterItem
                  key={index}
                  title={character.name}
                  description={character.description}
                  href={`/character/${character.character_id}`}
                />
              ))
            )}
          </div>
        </section>
      </main>
    </>
  );
}
