"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/Auth";
import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  if (!user) {
    return router.push("/login");
  }

  return <main className={styles.main}></main>;
}
