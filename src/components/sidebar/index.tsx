"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/services/supabase";
import { useAuth } from "@/hooks/Auth";
import { Button } from "@/components/";
import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/images/Logomark.svg";

export default function Sidebar() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setIsLoading(false);
  };

  return (
    <aside>
      <div className="logo">
        <Image src={logo} alt="Logo" />
      </div>
      <div className="menu">
        <ul>
          <li>
            <Link href="/">Home</Link>
          </li>
        </ul>
      </div>
      <div className="logout">
        <Button onClick={handleLogout} label="Logout" isMedium />
      </div>
    </aside>
  );
}
