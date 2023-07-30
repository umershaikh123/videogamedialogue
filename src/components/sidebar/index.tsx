"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/services/supabase";
import { useAuth } from "@/hooks/Auth";
import { Button } from "@/components/";
import Image from "next/image";
import Link from "next/link";
import { EasyDX, LogoIcon } from "@/components/icons";
import styles from "./styles.module.css";
import SidebarLink from "./SidebarLink";
import { SidebarData } from "./SidebarData";
import { useRouter, usePathname } from "next/navigation";

export default function Sidebar() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    router.push("/login");
    await supabase.auth.signOut();
    setIsLoading(false);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.sidebarTop}>
        <div className={styles.sidebarLogo}>
          <EasyDX alt={"Easy DX"} width={169} height={32} />
          <h1 style={{ display: "none" }}>Easy DX</h1>
        </div>
        <ul className={styles.menu}>
          {SidebarData.map((item, index) => {
            return (
              <li key={index}>
                <SidebarLink
                  href={item.link}
                  title={item.title}
                  icon={item.icon}
                  active={pathname === item.link}
                />
              </li>
            );
          })}
        </ul>
      </div>
      <div className="logout">
        <p>{user?.user_metadata.name}</p>
        <p className="text-small">{user?.email}</p>
        <Button onClick={handleLogout} label="Logout" isMedium />
      </div>
    </div>
  );
}
