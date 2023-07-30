"use client";
import { useState, useRef, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/Auth";
import { uploadVoice } from "@/services/API";
import Image from "next/image";
import {
  CharacterItem,
  ClipPlayer,
  DashboardButton,
  Divider,
  SectionHeader,
  Sidebar,
  Spinner,
  SupportText,
} from "@/components";
import { AddIcon } from "@/components/icons";
import styles from "./styles.module.css";
import { useEffect } from "react";
import { supabase } from "@/services/supabase";
import { Listbox } from "@headlessui/react";
import PlaceholderImage from "@/images/placeholder.png";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

export default function NewCharacter() {
  const router = useRouter();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const preCharacterId = searchParams.get("character_id");

  const [fileUploadName, setFileUploadName] = useState("");
  const [fileUploadText, setFileUploadText] = useState("");
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character>(
    characters[0]
  );

  const [clip, setClip] = useState<Clip | null>(null);
  const [hasClip, setHasClip] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

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
    if (preCharacterId !== null) {
      setSelectedCharacter(
        data.find((character) => character.character_id === preCharacterId) ||
          characters[0]
      );
    }
  };

  useEffect(() => {
    retreiveCharacterData();
  }, []);

  const handleGenerateVoice = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!selectedCharacter) {
      alert("Please select a character");
      return;
    }

    try {
      console.log(selectedCharacter.elevenlabs_id);
      const apiEndpoint = `https://api.elevenlabs.io/v1/text-to-speech/${selectedCharacter.elevenlabs_id}`;
      const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;

      const headers = {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
        voice_id: `"${selectedCharacter.elevenlabs_id}"`,
      };

      const data = {
        text: fileUploadText,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.4,
          similarity_boost: 0,
          style: 0.5,
          use_speaker_boost: true,
        },
      };

      const response = await axios.post(apiEndpoint, data, {
        headers: headers,
        responseType: "arraybuffer",
      });
      if (response.status !== 200) {
        console.error("Request failed with status code:", response.status);
        console.error(response.data);
        return;
      }

      const clip_id = uuidv4();

      const { data: uploadResponse, error } = await supabase
        .from("clips")
        .insert([
          {
            character_id: selectedCharacter.character_id,
            name: fileUploadName,
            text: fileUploadText,
            clip_id: clip_id,
            user_id: user.id,
          },
        ]);
      if (error) {
        throw error;
      }

      const audioBlob = new Blob([response.data], { type: "audio/mpeg" });
      const audioUrl = URL.createObjectURL(audioBlob);

      const { error: error2 } = await supabase.storage
        .from("clips")
        .upload(`${user.id}/${clip_id}.mp3`, audioBlob);
      if (error2) {
        throw error2;
      }

      const newClip: Clip = {
        name: fileUploadName,
        text: fileUploadText,
        clip_url: audioUrl,
        character_id: selectedCharacter.character_id,
        clip_id: clip_id,
        user_id: user.id,
      };

      return setClip(newClip);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Sidebar />
      {clip === null ? (
        <>
          <main className="main-wrapper">
            <div className="page-header">
              <h2 className="heading-large">Create an Audio Clip</h2>
            </div>
            <section>
              <Divider top={0} bottom={24} />
              <form onSubmit={handleGenerateVoice}>
                <div className="step-content">
                  <SupportText name="Character Name" />
                  <Listbox
                    value={selectedCharacter}
                    onChange={(value) => {
                      setSelectedCharacter(value);
                    }}
                  >
                    <div className={styles.dropdownRelative}>
                      <Listbox.Button className={styles.dropdown}>
                        <div className={styles.dropdownItem}>
                          <Image
                            className={styles.characterImage}
                            alt={
                              selectedCharacter?.name
                                ? selectedCharacter.name
                                : ""
                            }
                            src={
                              selectedCharacter?.image_url
                                ? selectedCharacter.image_url
                                : PlaceholderImage
                            }
                            width={20}
                            height={20}
                          />
                          {selectedCharacter?.name ? (
                            selectedCharacter.name
                          ) : (
                            <p>Select a character</p>
                          )}
                        </div>
                      </Listbox.Button>
                      <Listbox.Options className={styles.dropdownList}>
                        {characters.map((character) => (
                          <Listbox.Option
                            key={character.character_id}
                            value={character}
                            className={styles.dropdownItem}
                          >
                            <Image
                              className={styles.characterImage}
                              alt={character.name}
                              src={
                                character.image_url
                                  ? character.image_url
                                  : PlaceholderImage
                              }
                              width={20}
                              height={20}
                            />
                            {character.name}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </div>
                  </Listbox>
                </div>
                <Divider top={20} bottom={20} />
                <div className="step-content">
                  <SupportText name="File Name" />
                  <input
                    className={styles.input}
                    type="text"
                    name="fileName"
                    placeholder="Cut Scene 1, Line 2"
                    onChange={(e) => setFileUploadName(e.target.value)}
                    value={fileUploadName}
                  />
                </div>
                <Divider top={20} bottom={20} />
                <div className="step-content">
                  <SupportText name="Text" />
                  <textarea
                    className={styles.input + " " + styles.textArea}
                    name="fileName"
                    placeholder="Cut Scene 1, Line 2"
                    onChange={(e) => setFileUploadText(e.target.value)}
                    value={fileUploadText}
                  />
                </div>
                <Divider top={20} bottom={20} />
                <div className="buttons-wrapper">
                  <button
                    className="button-secondary"
                    type="button"
                    onClick={() => router.push("/")}
                  >
                    Cancel
                  </button>
                  <button className="button-primary" type="submit">
                    Generate Audio
                  </button>
                </div>
              </form>
            </section>
          </main>
        </>
      ) : (
        <>
          <main className="main-wrapper">
            <div className="page-header">
              <h2 className="heading-large">Audio Clip Created</h2>
            </div>
            <section>
              <SectionHeader title="Export Your Audio" />
              <Divider top={20} bottom={24} />
              <ClipPlayer name={clip?.name} src={clip?.clip_url} />
              <Divider top={20} bottom={20} />
              <div className="buttons-wrapper">
                <button
                  className="button-primary"
                  type="button"
                  onClick={() =>
                    router.push(`/character/${clip?.character_id}`)
                  }
                >
                  View Character and export clip
                </button>
              </div>
            </section>
          </main>
        </>
      )}
    </>
  );
}
