"use client";
import { useState } from "react";
import { supabase } from "../../../services/supabase";
import "../styles.css";
import { InputBlock, AuthHeader, Button } from "@/components";
import Link from "next/link";
import Image from "next/image";
import { LogoIcon, MailIcon, ArrowIcon } from "@/components/icons";
import { Spinner } from "@/components";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (event: any) => {
    event.preventDefault();
    setIsLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name: name } },
    });

    setIsLoading(false);

    if (error) {
      alert(error.message);
    } else {
      alert("Account successfully created!");
      router.push("/");
    }
  };
  ``;

  return (
    <main className="main">
      <div className={"section"}>
        <div className={"container"}>
          <div className={"loginWrapper"}>
            <AuthHeader
              title="Start your free trial"
              description="Sign up in less than 2 minutes."
              logo={<LogoIcon width={56} height={56} />}
            />
            <form className={"loginBody"} onSubmit={handleSignUp}>
              <div className={"inputsWrapper"}>
                <InputBlock
                  label="Name*"
                  placeholder="Enter your name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autocomplete="on"
                />
                <InputBlock
                  label="Email*"
                  placeholder="Enter your email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autocomplete="on"
                />
                <InputBlock
                  label="Password*"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autocomplete="current-password"
                />
              </div>
              <div className={"ctaWrapper"}>
                {!isLoading ? (
                  <>
                    <Button label="Sign up" type="submit" />
                  </>
                ) : (
                  <Spinner />
                )}
              </div>
            </form>
            <div className={"signUp"}>
              Already have an account?{" "}
              <Link href="/login" className={"link"}>
                Log in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
