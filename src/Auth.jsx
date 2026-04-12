import { useState } from "react";
import { supabase } from "./supabaseClient";
import { Mail, Eye, EyeOff, LogIn, UserPlus, ArrowLeft, Building2, User, Phone, MapPin, FileText, Lock } from "lucide-react";
const LOGO_BASE64 = "data:image/png;base64,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";

// InputField defined OUTSIDE Auth to prevent focus loss on re-renders
const InputField = ({ icon: Icon, label, type = "text", value, onChange, placeholder, maxLength }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="relative">
      <Icon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition text-sm"
      />
    </div>
  </div>
);

export default function Auth() {
  const [mode, setMode] = useState("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Registration fields
  const [regNome, setRegNome] = useState("");
  const [regCognome, setRegCognome] = useState("");
  const [regAzienda, setRegAzienda] = useState("");
  const [regPiva, setRegPiva] = useState("");
  const [regCF, setRegCF] = useState("");
  const [regTelefono, setRegTelefono] = useState("");
  const [regIndirizzo, setRegIndirizzo] = useState("");

  const validateCF = (cf) => {
    if (!cf) return false;
    const cleaned = cf.trim().toUpperCase();
    return /^[A-Z0-9]{16}$/.test(cleaned);
  };

  const validatePIVA = (piva) => {
    if (!piva) return false;
    const cleaned = piva.trim();
    return /^[0-9]{11}$/.test(cleaned);
  };

  const checkUniqueness = async (field, value) => {
    const { data } = await supabase.from("profiles").select("id").eq(field, value.trim()).limit(1);
    return !data || data.length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) throw err;
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!regNome || !regCognome || !regAzienda || !regPiva || !regCF || !regTelefono || !regIndirizzo || !email || !password) {
      setError("Compila tutti i campi obbligatori");
      return;
    }
    if (!validateCF(regCF)) {
      setError("Codice Fiscale non valido. Deve essere di 16 caratteri alfanumerici.");
      return;
    }
    if (!validatePIVA(regPiva)) {
      setError("Partita IVA non valida. Deve essere di 11 cifre.");
      return;
    }
    if (password.length < 6) {
      setError("La password deve avere almeno 6 caratteri.");
      return;
    }
    setLoading(true);
    try {
      const cfUnique = await checkUniqueness("codice_fiscale", regCF.toUpperCase());
      if (!cfUnique) {
        throw new Error("Esiste già un account con questo Codice Fiscale.");
      }
      const pivaUnique = await checkUniqueness("piva", regPiva.trim());
      if (!pivaUnique) {
        throw new Error("Esiste già un account con questa Partita IVA.");
      }
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) throw signUpError;
      if (data?.user) {
        const { error: profileError } = await supabase.from("profiles").upsert({
          id: data.user.id,
          nome: regNome.trim(),
          cognome: regCognome.trim(),
          nome_azienda: regAzienda.trim(),
          piva: regPiva.trim(),
          codice_fiscale: regCF.trim().toUpperCase(),
          telefono: regTelefono.trim(),
          indirizzo: regIndirizzo.trim(),
          email: email.trim(),
          subscription_status: "none"
        });
        if (profileError) console.error("Profile save error:", profileError);
      }
      setMessage("Registrazione completata! Controlla la tua email per confermare l'account.");
      setMode("login");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin
      });
      if (err) throw err;
      setMessage("Email di recupero inviata! Controlla la tua casella.");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <img src={LOGO_BASE64} alt="Logo" className="w-16 h-16 mx-auto mb-3 rounded-xl object-contain bg-white p-1" />
          <h1 className="text-2xl font-bold text-gray-800">Preventivo Intelligente</h1>
          <p className="text-gray-500 text-sm mt-1">Crea preventivi professionali in 30 secondi usando l'AI</p>
        {mode === "register" && (
          <div className="mt-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
            <p className="text-green-700 font-bold text-sm text-center">
              I primi 14 giorni sono GRATUITI!
            </p>
            <p className="text-green-600 text-xs text-center mt-1">
              Nessun addebito nei primi 14 giorni. Puoi disdire in qualsiasi momento.
            </p>
          </div>
        )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          {mode !== "forgot" && (
            <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
              <button
                onClick={() => { setMode("login"); setError(""); setMessage(""); }}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition ${mode === "login" ? "bg-white text-orange-600 shadow-sm" : "text-gray-500"}`}
              >Accedi</button>
              <button
                onClick={() => { setMode("register"); setError(""); setMessage(""); }}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition ${mode === "register" ? "bg-white text-orange-600 shadow-sm" : "text-gray-500"}`}
              >Registrati</button>
            </div>
          )}

          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3 mb-4">{error}</div>}
          {message && <div className="bg-green-50 border border-green-200 text-green-600 text-sm rounded-xl p-3 mb-4">{message}</div>}

          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <InputField icon={Mail} label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="la-tua-email@esempio.it" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="La tua password"
                    className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition text-sm"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50">
                <LogIn size={18} />{loading ? "Accesso..." : "Accedi"}
              </button>
              <button type="button" onClick={() => { setMode("forgot"); setError(""); }} className="w-full text-sm text-orange-500 hover:text-orange-600">Password dimenticata?</button>
            </form>
          )}

          {mode === "register" && (
            <form onSubmit={handleSignup} className="space-y-3">
              <InputField icon={User} label="Nome *" value={regNome} onChange={(e) => setRegNome(e.target.value)} placeholder="Il tuo nome" />
              <InputField icon={User} label="Cognome *" value={regCognome} onChange={(e) => setRegCognome(e.target.value)} placeholder="Il tuo cognome" />
              <InputField icon={Building2} label="Nome Azienda *" value={regAzienda} onChange={(e) => setRegAzienda(e.target.value)} placeholder="Nome della tua impresa" />
              <InputField icon={FileText} label="Partita IVA * (11 cifre)" value={regPiva} onChange={(e) => setRegPiva(e.target.value.replace(/\D/g, "").slice(0, 11))} placeholder="12345678901" maxLength={11} />
              <InputField icon={FileText} label="Codice Fiscale * (16 caratteri)" value={regCF} onChange={(e) => setRegCF(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 16))} placeholder="RSSMRA85M01H501Z" maxLength={16} />
              <InputField icon={Phone} label="Telefono *" value={regTelefono} onChange={(e) => setRegTelefono(e.target.value)} placeholder="+39 333 1234567" />
              <InputField icon={MapPin} label="Indirizzo *" value={regIndirizzo} onChange={(e) => setRegIndirizzo(e.target.value)} placeholder="Via Roma 1, Milano" />
              <div className="border-t border-gray-100 my-2"></div>
              <InputField icon={Mail} label="Email *" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="la-tua-email@esempio.it" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password * (min. 6 caratteri)</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimo 6 caratteri"
                    className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition text-sm"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50">
                <UserPlus size={18} />{loading ? "Registrazione..." : "Crea Account"}
              </button>
            </form>
          )}

          {mode === "forgot" && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <button type="button" onClick={() => setMode("login")} className="text-sm text-orange-500 flex items-center gap-1"><ArrowLeft size={14} />Torna al login</button>
              <InputField icon={Mail} label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="la-tua-email@esempio.it" />
              <button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-xl transition disabled:opacity-50">
                {loading ? "Invio..." : "Invia link di recupero"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">©2026 Protocollo Edile™</p>
      </div>
    </div>
  );
}
