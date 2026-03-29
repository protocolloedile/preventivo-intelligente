import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import App from "./App.jsx";
import Auth from "./Auth.jsx";

export default function AppWrapper() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return <App session={session} />;
}
