import { useState, useContext } from "react";
import AuthContext from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Loader,
  LayoutDashboard,
} from "lucide-react";
import { useRive, useStateMachineInput } from "@rive-app/react-canvas";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  /* ---------------- RIVE ---------------- */
  const { rive, RiveComponent } = useRive({
    src: "/login-character.riv",
    stateMachines: "Login Machine",
    autoplay: true,
  });

  const isChecking = useStateMachineInput(rive, "Login Machine", "isChecking");
  const isHandsUp = useStateMachineInput(rive, "Login Machine", "isHandsUp");
  const isSuccess = useStateMachineInput(rive, "Login Machine", "isSuccess");
  const isFail = useStateMachineInput(rive, "Login Machine", "isFail");

  const [error, setError] = useState("");

  /* ---------------- LOGIN ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Clear previous errors

    if (isChecking) isChecking.value = false;
    if (isHandsUp) isHandsUp.value = false;

    const result = await login(email, password);

    if (result.success) {
      if (isSuccess) isSuccess.value = true;
      setTimeout(() => {
        navigate(
          result.user.role === "developer"
            ? "/developer-dashboard"
            : result.user.role === "admin"
              ? "/admin-dashboard"
              : "/resident-dashboard"
        );
      }, 900);
    } else {
      if (isFail) isFail.value = true;
      setLoading(false);
      setTimeout(() => { if (isFail) isFail.value = false; }, 1500);
      setError(result.message); // Set error message
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden">

      {/* background blobs */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-200/40 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* card */}
      <div className="relative z-10 w-full max-w-md p-8 bg-white rounded-3xl shadow-xl border border-slate-100 animate-fade-in-up mx-4">

        {/* ---------- CHARACTER HEADER (FINAL FIX) ---------- */}
        <div className="relative flex justify-center mb-12">

          {/* soft aura */}
          <div className="absolute top-6 w-[20rem] h-[20rem] rounded-full bg-indigo-300/20 blur-[90px]" />

          {/* HARD CIRCLE CROP */}
          <div className="relative w-64 h-64 rounded-full overflow-hidden bg-[#eef3f8]">

            {/* OVERSIZED RIVE CANVAS */}
            <div className="absolute inset-[-20%] flex items-center justify-center scale-[1.35]">
              <RiveComponent />
            </div>

          </div>
        </div>

        {/* logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 mb-4">
            <LayoutDashboard className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            NIVAS<span className="text-indigo-600">.APP</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium mt-1">
            Smart Society Management System
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Error Message */}
          {error && (
            <div className="bg-rose-50 text-rose-600 text-sm font-bold px-4 py-3 rounded-xl border border-rose-100 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          {/* email */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="email"
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all"
                placeholder="name@example.com"
                value={email}
                onFocus={() => {
                  isChecking.value = true;
                  isHandsUp.value = false;
                  setError("");
                }}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                required
              />
            </div>
          </div>

          {/* password */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="password"
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onFocus={() => {
                  isHandsUp.value = true;
                  isChecking.value = false;
                  setError("");
                }}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                required
              />
            </div>
          </div>

          {/* button */}
          <button
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-70"
          >
            {loading ? (
              <>
                Logging in <Loader className="animate-spin" size={20} />
              </>
            ) : (
              <>
                Sign In <ArrowRight size={20} />
              </>
            )}
          </button>

        </form>

        {/* footer */}
        <div className="mt-8 pt-6 border-t border-slate-50 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50 py-2 px-4 rounded-full">
            <ShieldCheck size={14} className="text-emerald-500" />
            Secure Encrypted Login
          </div>
        </div>

      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Login;
