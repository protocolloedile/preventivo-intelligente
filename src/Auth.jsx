import { useState } from "react";
import { supabase } from "./supabaseClient";
import { Mail, Eye, EyeOff, LogIn, UserPlus, ArrowLeft, Building2, User, Phone, MapPin, FileText, Lock } from "lucide-react";

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
  const [mode, setMode] = useState("login");
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
          <div className="text-5xl mb-3">🏗️</div>
          <h1 className="text-2xl font-bold text-gray-800">Preventivo Intelligente</h1>
          <p className="text-gray-500 text-sm mt-1">Crea preventivi edili professionali con l'AI</p>
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
