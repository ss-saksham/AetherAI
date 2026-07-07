import { useDispatch, useSelector } from "react-redux";
import { FaGoogle } from "react-icons/fa";
import ArtifactPanel from "../components/ArtifactPanel";
import ChatArea from "../components/ChatArea";
import Sidebar from "../components/Sidebar";
import api from "../utils/axios";
import { setUserData } from "../redux/user.slice";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../firebase";

function Home() {
  const { userData } = useSelector(state => state.user);
  const dispatch=useDispatch()
const login=async (token)=>{
  try {
    const {data}=await api.post(`/api/auth/login`,{token})
    dispatch(setUserData(data.user))
  } catch (error) {
    console.log(error)
  }
}
  const handleGoogleLogin =async () => {
     const result =
     await signInWithPopup(auth,googleProvider);
    
     const token =await result.user.getIdToken();
     await login(token)
  };

  return (
    <div className="relative h-screen flex bg-[#07080e] text-white overflow-hidden font-sans">
      {/* Subtle grid pattern overlay with warm grain effect */}
      <div className="absolute inset-0 bg-grid-pattern opacity-70 pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/20 via-slate-950/40 to-black pointer-events-none z-0" />

      {/* Background ambient glow circles with varying speeds */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[140px] pointer-events-none z-0 animate-float-1" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/10 blur-[140px] pointer-events-none z-0 animate-float-2" />
      <div className="absolute top-[30%] left-[25%] w-[40%] h-[40%] rounded-full bg-cyan-600/6 blur-[120px] pointer-events-none z-0 animate-float-1" />

      <Sidebar />
      <ChatArea />
      <ArtifactPanel />

      {!userData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-[12px]">
          <div className="w-[380px] bg-[#0c0d12]/70 border border-white/[0.07] backdrop-blur-2xl rounded-[28px] p-9 flex flex-col items-center gap-7 shadow-[0_24px_80px_rgba(0,0,0,0.65)] hover:border-white/[0.12] transition-all duration-500">
            
            {/* Custom Glowing Logo */}
            <div className="relative w-20 h-20 flex items-center justify-center animate-logo-glow">
              <div className="absolute inset-0 rounded-full bg-indigo-500/15 blur-[12px] animate-pulse" />
              <svg width="52" height="52" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative">
                <path d="M32 3L57 17.5V46.5L32 61L7 46.5V17.5L32 3Z" stroke="url(#loginHex)" strokeWidth="1.5" strokeLinejoin="round" opacity="0.35" />
                <path d="M32 3L57 17.5V46.5L32 61" stroke="url(#loginHex)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M22 22C22 16.48 26.48 12 32 12C37.52 12 42 16.48 42 22C42 27.52 37.52 32 32 32" stroke="url(#loginCore)" strokeWidth="3" strokeLinecap="round" />
                <path d="M42 42C42 47.52 37.52 52 32 52C26.48 52 22 47.52 22 42C22 36.48 26.48 32 32 32" stroke="url(#loginCore)" strokeWidth="3" strokeLinecap="round" />
                <circle cx="32" cy="32" r="5" fill="url(#loginInner)" />
                <circle cx="22" cy="22" r="3" fill="#22D3EE" />
                <circle cx="42" cy="42" r="3" fill="#C084FC" />
                <defs>
                  <linearGradient id="loginHex" x1="7" y1="3" x2="57" y2="61">
                    <stop stopColor="#818CF8" />
                    <stop offset="0.5" stopColor="#C084FC" />
                    <stop offset="1" stopColor="#22D3EE" />
                  </linearGradient>
                  <linearGradient id="loginCore" x1="22" y1="12" x2="42" y2="52">
                    <stop stopColor="#818CF8" />
                    <stop offset="0.5" stopColor="#C084FC" />
                    <stop offset="1" stopColor="#818CF8" />
                  </linearGradient>
                  <linearGradient id="loginInner" x1="27" y1="27" x2="37" y2="37">
                    <stop stopColor="#22D3EE" />
                    <stop offset="1" stopColor="#818CF8" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
 
            <div className="flex flex-col gap-2 text-center">
              <h2 className="text-[22px] font-bold text-slate-100 tracking-tight">
                Welcome to CortexAI
              </h2>
              <p className="text-[13px] text-slate-400 leading-relaxed max-w-[260px] mx-auto">
                Sign in to step into your collaborative multi-agent coding, search, and creation workspace.
              </p>
            </div>
 
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl text-sm font-semibold text-white bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 hover:from-indigo-400 hover:via-indigo-500 hover:to-violet-600 border border-indigo-400/20 shadow-[0_4px_20px_rgba(99,102,241,0.25)] hover:shadow-[0_4px_24px_rgba(99,102,241,0.45)] hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 cursor-pointer outline-none"
            >
              <FaGoogle size={14} className="text-white" />
              Continue with Google
            </button>
            
            <p className="text-[11px] text-slate-500 text-center leading-normal max-w-[240px]">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
 
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;