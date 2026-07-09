import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaGoogle } from "react-icons/fa";
import ArtifactPanel from "../components/ArtifactPanel";
import ChatArea from "../components/ChatArea";
import Sidebar from "../components/Sidebar";
import api from "../utils/axios";
import { setUserData } from "../redux/user.slice";
import { signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { auth, googleProvider } from "../../firebase";

import CommandPalette from "../components/CommandPalette";

function Home() {
  const { userData } = useSelector(state => state.user);
  const dispatch = useDispatch();
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  const login = async (token) => {
    try {
      const { data } = await api.post(`/api/auth/login`, { token });
      dispatch(setUserData(data.user));
      
      // Force window focus and DOM reflow to bypass browser popup paint-suspension bugs
      setTimeout(() => {
        window.focus();
        if (typeof document !== "undefined") {
          const _ = document.body?.offsetHeight;
        }
      }, 50);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    // Proactively ping Gateway and Auth services in parallel to trigger Render spin-ups
    const wakeUpServices = async () => {
      console.log("⚡ Proactively waking up backend microservices...");
      api.get("/api/me").catch(() => {});
      api.get("/api/auth").catch(() => {});
    };
    wakeUpServices();

    const initAuth = async () => {
      try {
        // 1. Check if session cookie is already active
        const { data } = await api.get("/api/me");
        if (data && data.user) {
          dispatch(setUserData(data.user));
          setCheckingAuth(false);
          return;
        }
      } catch (err) {
        console.log("No active session found:", err.message);
      }

      // 2. Check for Firebase Auth redirect results
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          const token = await result.user.getIdToken();
          await login(token);
        }
      } catch (error) {
        console.error("Redirect login error:", error);
      } finally {
        setCheckingAuth(false);
      }
    };
    initAuth();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

      if (isMobile) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        const result = await signInWithPopup(auth, googleProvider);
        const token = await result.user.getIdToken();
        await login(token);
      }
    } catch (error) {
      console.error("Google Login Error:", error);
    }
  };

  if (checkingAuth) {
    return (
      <div className="h-screen w-screen bg-[#0a0a0b] flex items-center justify-center select-none">
        <div className="w-5 h-5 border border-white/10 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative h-screen flex bg-[#0a0a0b] text-[#f4f4f5] overflow-hidden font-sans select-none">
      {/* Global Command Palette */}
      <CommandPalette />

      {/* Editorial layout container */}
      <Sidebar />
      <ChatArea />
      <ArtifactPanel />

      {!userData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="w-[360px] bg-[#121214] border border-white/[0.04] rounded-2xl p-8 flex flex-col items-center gap-6 shadow-[0_16px_40px_rgba(0,0,0,0.65)]">
            
            {/* Minimalist Geometric Icon (Quiet & Crisp) */}
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#f4f4f5]">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 3v18" />
              </svg>
            </div>
 
            <div className="flex flex-col gap-1 text-center">
              <h2 className="text-[17px] font-bold text-white tracking-tight">
                Aether
              </h2>
              <p className="text-[12px] text-[#a1a1aa] leading-relaxed max-w-[240px] mx-auto">
                Sign in to access your multi-agent workspace, search, and coding environments.
              </p>
            </div>
 
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-2.5 py-3 rounded-lg text-xs font-bold text-[#09090b] bg-[#f4f4f5] hover:bg-white transition-all active:scale-[0.98] cursor-pointer"
            >
              <FaGoogle size={12} />
              Continue with Google
            </button>
            
            <p className="text-[10px] text-[#71717a] text-center leading-relaxed max-w-[220px]">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
 
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;