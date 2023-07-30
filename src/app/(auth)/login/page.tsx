"use client";
import { useState } from "react";
import { supabase } from "../../../services/supabase";
import "../styles.css";
import { InputBlock, AuthHeader, Button } from "@/components";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogoIcon } from "@/components/icons";
import { Spinner } from "@/components";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (event: any) => {
    event.preventDefault();

    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setIsLoading(false);
    if (error) {
      alert(error.message);
    } else {
      router.push("/");
    }
  };

  return (
    <main className={"main"}>
      <div className={"section"}>
        <div className={"container"}>
          <div className={"loginWrapper"}>
            <AuthHeader
              title="Welcome back"
              description="Please enter your details."
              logo={LogoIcon}
            />
            <form className={"loginBody"} onSubmit={handleLogin}>
              <div className={"inputsWrapper"}>
                <InputBlock
                  label="Email"
                  placeholder="Enter your email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autocomplete="on"
                />
                <InputBlock
                  label="Password"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autocomplete="current-password"
                />
              </div>
              <div className={"row"}>
                <Link href="" className={"link"}>
                  Forgot Password
                </Link>
              </div>
              <div className={"ctaWrapper"}>
                {!isLoading ? (
                  <>
                    <Button label="Sign in" type="submit" />
                  </>
                ) : (
                  <Spinner />
                )}
              </div>
            </form>
            <div className={"signUp"}>
              Don&apos;t have an account?{" "}
              <Link href="/signup" className={"link"}>
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
