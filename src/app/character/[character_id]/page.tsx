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
import "./characterPage.css";
import { useEffect } from "react";
import { supabase } from "@/services/supabase";
import PlaceholderImage from "@/images/placeholder.png";
import { AddIcon, ExportIcon, PlayIcon, TrashIcon } from "@/components/icons";
import toWav from "audiobuffer-to-wav";

export default function CharacterPage({
  params,
}: {
  params: { character_id: string };
}) {
  const router = useRouter();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [character, setCharacter] = useState<Character | null>(null);
  const [clips, setClips] = useState<Clip[] | null>(null);
  const [exportModal, setExportModal] = useState(false);
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null);
  const [downloadFormat, setDownloadFormat] = useState("wav");

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
    setIsLoading(false);
    setCharacter(data);
  };

  const retreiveCharacterClips = async () => {
    const { data, error } = await supabase
      .from("clips")
      .select("*")
      .eq("character_id", params.character_id);
    if (error) {
      throw error;
    }
    setIsLoading(false);
    setClips(data);
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

  const getClipAudio = async (clip_id: string, userId: any) => {
    const { data } = await supabase.storage
      .from("clips")
      .download(`${userId}/${clip_id}.mp3`);

    if (data) {
      const audioBlob = new Blob([data], { type: "audio/mpeg" });
      const audioUrl = URL.createObjectURL(audioBlob);
      return audioUrl;
    }
  };

  const handleExportClick = async (clip: Clip) => {
    setSelectedClip(clip);
    setExportModal(true);
  };

  /*const handleDownload = async (clip_name: string, clip_id: string) => {
    const src = await getClipAudio(clip_id, user?.id);
    const link = document.createElement("a");
    if (src) {
      link.href = src;
      link.download = `${clip_name}.mp3`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };*/

  /*const handleDownload = async (clip_name: string, clip_id: string) => {
    console.log(downloadFormat);
    const src = await getClipAudio(clip_id, user?.id);
    if (!src) {
      return;
    }

    const audioContext = new window.AudioContext();

    fetch(src)
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer))
      .then((audioBuffer) => {
        let wav;
        if (downloadFormat === "wav") {
          console.log("into wav");
          wav = toWav(audioBuffer);
          const blob = new Blob([new DataView(wav)], { type: "audio/wav" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${clip_name}.wav`;
          link.click();
        } else {
          const link = document.createElement("a");
          link.href = src;
          link.download = `${clip_name}.mp3`;
          link.click();
        }
      });
  };*/

  function audioBufferToWav(buffer: AudioBuffer): Blob {
    let numOfChan = buffer.numberOfChannels,
      length = buffer.length * numOfChan * 2 + 44,
      bufferOut = new ArrayBuffer(length),
      view = new DataView(bufferOut),
      channels = [],
      i,
      sample,
      offset = 0,
      pos = 0;

    // write WAVE header
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"

    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2); // block-align
    setUint16(16); // 16-bit (hardcoded in this demo)

    setUint32(0x61746164); // "data" - chunk
    setUint32(length - pos - 4); // chunk length

    // write interleaved data
    for (i = 0; i < buffer.numberOfChannels; i++)
      channels.push(buffer.getChannelData(i));

    while (pos < length) {
      for (i = 0; i < numOfChan; i++) {
        // interleave channels
        sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
        view.setInt16(pos, sample, true); // write 16-bit sample
        pos += 2;
      }
      offset++; // next source sample
    }

    // create Blob
    return new Blob([bufferOut], { type: "audio/wav" });

    function setUint16(data: number) {
      view.setUint16(pos, data, true);
      pos += 2;
    }

    function setUint32(data: number) {
      view.setUint32(pos, data, true);
      pos += 4;
    }
  }

  const handleDownload = async (clip_name: string, clip_id: string) => {
    const src = await getClipAudio(clip_id, user?.id);

    if (!src) {
      return;
    }

    if (downloadFormat === "mp3") {
      const link = document.createElement("a");
      link.href = src;
      link.download = `${clip_name}.mp3`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const response = await fetch(src);
      const buffer = await response.arrayBuffer();
      const audioContext = new window.AudioContext();

      const audioSource = await audioContext.decodeAudioData(buffer);

      const offlineContext = new OfflineAudioContext(
        audioSource.numberOfChannels,
        audioSource.duration * audioSource.sampleRate,
        audioSource.sampleRate
      );

      const source = offlineContext.createBufferSource();
      source.buffer = audioSource;
      source.connect(offlineContext.destination);
      source.start(0);

      offlineContext.startRendering().then((renderedBuffer) => {
        const audioBlob = audioBufferToWav(renderedBuffer); // Use the function from audio-buffer-to-wav library

        // For OGG conversion, change MIME type to 'audio/ogg'
        let options = undefined;
        if (downloadFormat === "wav") {
          options = { type: "audio/wav" };
        } else if (downloadFormat === "ogg") {
          options = { type: "audio/ogg" };
        }

        const newAudioBlob = new Blob([audioBlob], options);
        const newAudioUrl = URL.createObjectURL(newAudioBlob);

        const link = document.createElement("a");
        link.href = newAudioUrl;
        link.download = `${clip_name}.${downloadFormat}`;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    }
  };

  const handleDelete = async (clip_id: string) => {
    const newClips = clips?.filter((clip) => clip.clip_id !== clip_id) || null;
    setClips(newClips);

    const { error } = await supabase
      .from("clips")
      .delete()
      .eq("clip_id", clip_id);
    if (error) {
      throw error;
    }

    const { error: fileError } = await supabase.storage
      .from("clips")
      .remove([`${user?.id}/${clip_id}.mp3`]);
    if (fileError) {
      throw fileError;
    }

    retreiveCharacterClips();
  };

  useEffect(() => {
    retreiveCharacterData();
    retreiveCharacterClips();
  }, []);

  return (
    <>
      {exportModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <p style={{ fontWeight: 600 }} className="text-smedium">
                Export Your Audio
              </p>
            </div>
            <Divider top={16} bottom={16} />
            <div className="modal-options">
              <div className="modal-option">
                <SupportText name="Format" />
                <select
                  className="modal-select"
                  onChange={(e) => setDownloadFormat(e.target.value)}
                >
                  <option value="wav">wav</option>
                  <option value="ogg">ogg</option>
                  <option value="mp3">mp3</option>
                </select>
              </div>
            </div>
            <Divider top={16} bottom={16} />
            <div className="buttons-wrapper">
              <button
                className="button-primary"
                onClick={() =>
                  handleDownload(
                    selectedClip ? selectedClip?.name : "",
                    selectedClip ? selectedClip?.clip_id : ""
                  )
                }
              >
                Export
              </button>
              <button
                className="button-secondary"
                onClick={() => setExportModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
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
                    router.push(`/character/${character.character_id}/edit`)
                  }
                >
                  Edit Character
                </button>
                <button
                  className="button-primary"
                  onClick={() =>
                    router.push(
                      `/new-clip?character_id=${character.character_id}`
                    )
                  }
                >
                  <AddIcon width={20} height={20} />
                  New Audio Clip
                </button>
              </div>
            </div>
            <section>
              <div className="table">
                <div className="table-header">
                  <div className="table-cell">
                    <p className="table-header_title">Audio Clip Name</p>
                  </div>
                  <div className="table-cell">
                    <p className="table-header_title">Created on</p>
                  </div>
                  <div className="table-cell"></div>
                  <div className="table-cell"></div>
                </div>
                {clips !== null && clips.length > 0 ? (
                  <>
                    {clips?.map((clip) => (
                      <div className="table-row" key={clip.clip_id}>
                        <div className="table-cell">
                          <PlayIcon width={20} height={20} />
                          <p className="table-row_title">{clip.name}</p>
                        </div>
                        <div className="table-cell">
                          <p className="table-row_title">
                            {clip.created_at ? getTime(clip.created_at) : ""}
                          </p>
                        </div>
                        <div className="table-cell">
                          <button
                            className="button-icon"
                            onClick={() => handleDelete(clip.clip_id)}
                          >
                            <TrashIcon width={20} height={20} />
                          </button>
                        </div>
                        <div className="table-cell">
                          <button
                            className="button-icon"
                            onClick={() => handleExportClick(clip)}
                          >
                            <ExportIcon width={20} height={20} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="table-row">
                    <div className="table-cell">
                      <p className="table-row_title">No clips found</p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </>
        ) : (
          <Spinner />
        )}
      </main>
    </>
  );
}
