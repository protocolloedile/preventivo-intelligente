import { useState } from "react";
import { supabase } from "./supabaseClient";
import { Mail, Eye, EyeOff, LogIn, UserPlus, ArrowLeft, Building2 } from "lucide-react";

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes("Invalid login")) setError("Email o password non corretti");
      else if (error.message.includes("Email not confirmed")) setError("Conferma la tua email prima di accedere.");
      else setError(error.message);
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) { setError("Le password non coincidono"); return; }
    if (password.length < 6) { setError("La password deve avere almeno 6 caratteri"); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      if (error.message.includes("already registered")) setError("Questa email è già registrata.");
      else setError(error.message);
    } else {
      setMessage("Registrazione completata! Controlla la tua email per confermare l'account.");
      setMode("login"); setPassword(""); setConfirmPassword("");
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    if (!email) { setError("Inserisci la tua email"); return; }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
    if (error) setError(error.message);
    else { setMessage("Ti abbiamo inviato un'email per reimpostare la password."); setMode("login"); }
    setLoading(false);
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl mb-4 shadow-lg">
            <Building2 size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Preventivo Intelligente</h1>
          <p className="text-gray-500 text-sm mt-1">Crea preventivi professionali in pochi minuti</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {mode !== "forgot" && (
            <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
              <button onClick={() => { setMode("login"); setError(""); setMessage(""); }} className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition ${mode === "login" ? "bg-white text-orange-600 shadow-sm" : "text-gray-500"}`}>Accedi</button>
              <button onClick={() => { setMode("register"); setError(""); setMessage(""); }} className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition ${mode === "register" ? "bg-white text-orange-600 shadow-sm" : "text-gray-500"}`}>Registrati</button>
            </div>
          )}
          {mode === "forgot" && (
            <button onClick={() => { setMode("login"); setError(""); }} className="flex items-center gap-1 text-gray-500 text-sm mb-4 hover:text-orange-500"><ArrowLeft size={16} /> Torna al login</button>
          )}
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">{error}</div>}
          {message && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-3 mb-4">{message}</div>}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><div className="relative"><Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="mario@azienda.it" className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400" required /></div></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Password</label><div className="relative"><input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="La tua password" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400 pr-10" required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2.5 rounded-lg font-medium text-sm hover:from-orange-600 hover:to-orange-700 transition disabled:opacity-50 flex items-center justify-center gap-2">{loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><LogIn size={18} /> Accedi</>}</button>
              <button type="button" onClick={() => { setMode("forgot"); setError(""); }} className="w-full text-sm text-gray-500 hover:text-orange-500 transition">Password dimenticata?</button>
            </form>
          )}
          {mode === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><div className="relative"><Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="mario@azienda.it" className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400" required /></div></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Password</label><div className="relative"><input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimo 6 caratteri" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400 pr-10" required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Conferma Password</label><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Ripeti la password" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400" required /></div>
              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2.5 rounded-lg font-medium text-sm hover:from-orange-600 hover:to-orange-700 transition disabled:opacity-50 flex items-center justify-center gap-2">{loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><UserPlus size={18} /> Crea Account</>}</button>
            </form>
          )}
          {mode === "forgot" && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Recupera Password</h3>
              <p className="text-sm text-gray-500">Inserisci la tua email e ti invieremo un link per reimpostare la password.</p>
              <div><div className="relative"><Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="mario@azienda.it" className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400" required /></div></div>
              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2.5 rounded-lg font-medium text-sm hover:from-orange-600 hover:to-orange-700 transition disabled:opacity-50">{loading ? "Invio in corso..." : "Invia Link di Recupero"}</button>
            </form>
          )}
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">Preventivo Intelligente v1.0</p>
      </div>
    </div>
  );
}
