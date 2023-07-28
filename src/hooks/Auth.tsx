"use client";
import { Session, User } from "@supabase/supabase-js";
import { useContext, useState, useEffect, createContext } from "react";
import { supabase } from "../services/supabase";
import { useRouter } from "next/navigation";

const AuthContext = createContext<{
  session: Session | null | undefined;
  user: User | null | undefined;
  name: string | null | undefined;
  signOut: () => void;
}>({ session: null, user: null, name: null, signOut: () => {} });

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<User>();
  const [session, setSession] = useState<Session | null>();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const { accessToken, ...rest } = children.props || {};

  const router = useRouter();

  useEffect(() => {
    const setData = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) throw error;

      setSession(session);
      setUser(session?.user);
      setName(session?.user?.user_metadata?.Name);
      setLoading(false);
    };

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.access_token !== accessToken) {
          router.refresh();
        }
        setSession(session);
        setUser(session?.user);
        setName(session?.user?.user_metadata?.Name);
        setLoading(false);
      }
    );

    setData();

    return () => {
      setName("");
      listener?.subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user,
    name,
    signOut: () => supabase.auth.signOut(),
  };

  return (
    <AuthContext.Provider value={value} {...rest}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
