"use client";
import { useState, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/Auth";
import { uploadVoice } from "@/services/API";
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
import { AddIcon, UploadIcon } from "@/components/icons";
import styles from "./styles.module.css";
import { retreiveListOfCharacters } from "@/services/API";
import { useEffect } from "react";
import { supabase } from "@/services/supabase";
import { useDropzone, FileWithPath } from "react-dropzone";

export default function NewCharacter() {
  const router = useRouter();
  const { user } = useAuth();

  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    accept: {
      "audio/*": [".mp3", ".wav", ".ogg", ".m4a"],
    },
    maxFiles: 25,
  });
  const [fileUploadName, setFileUploadName] = useState("");
  const [fileUploadDescription, setFileUploadDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const files = acceptedFiles.map((file: FileWithPath) => (
    <li key={file.path}>
      {file.path} - {(file.size * 0.000001).toFixed(2)}MB
    </li>
  ));

  const [isLoading, setIsLoading] = useState(false);

  if (!user) {
    return router.push("/login");
  }

  const handleVoiceUpload = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const uploadedVoice = await uploadVoice(
      fileUploadName,
      fileUploadDescription,
      acceptedFiles,
      user?.id
    );
    if (uploadedVoice) {
      alert("Voice uploaded successfully!");
      setIsLoading(false);
      router.push("/new-clip?character_id=" + uploadedVoice[1]);
    } else {
      alert("Something went wrong, please try again.");
      setIsLoading(false);
    }
  };

  return (
    <>
      <Sidebar />
      <main className="main-wrapper">
        <div className="page-header">
          <h2 className="heading-large">Create a Character</h2>
        </div>
        <section>
          <SectionHeader
            title="Character Info"
            helpText="Add your character info and custom their voice."
          />
          <Divider top={20} bottom={24} />
          {isLoading ? (
            <Spinner />
          ) : (
            <form onSubmit={handleVoiceUpload}>
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
                  value={fileUploadDescription}
                />
              </div>
              <Divider top={20} bottom={20} />
              <div className="step-content">
                <SupportText
                  name="Upload Voice Samples"
                  description="Add up to 25 voice samples."
                />
                <div {...getRootProps({ className: "dropzone" })}>
                  <div className="upload-icon">
                    <UploadIcon width={40} height={40} />
                  </div>
                  <input ref={fileInputRef} {...getInputProps()} />
                  <div className="upload-content">
                    <p>
                      <span
                        style={{
                          color: "var(--primary-700",
                          cursor: "pointer",
                          fontWeight: "600",
                        }}
                      >
                        Click to upload
                      </span>{" "}
                      or drag and drop
                    </p>
                    <p>Audio files (up to 5MB each)</p>
                  </div>
                  <aside>
                    <ul>{files}</ul>
                  </aside>
                </div>
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
                  Save
                </button>
              </div>
            </form>
          )}
        </section>
      </main>
    </>
  );
}
