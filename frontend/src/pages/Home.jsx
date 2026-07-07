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
    <div className="relative h-screen flex bg-[#0a0a0b] text-[#f4f4f5] overflow-hidden font-sans select-none">
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
                CortexAI
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