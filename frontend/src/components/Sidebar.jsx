import { useEffect, useState } from "react";
import { Plus, MessageSquare, Settings, LogOut, User, PenSquare, Menu, X, Coins, ConeIcon, CoinsIcon, Trash } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import api from "../utils/axios";
import { setUserData } from "../redux/user.slice";
import { createConversation, getConversations, deleteConversation } from "../features/conversation.api";
import { addConversation, setConversations, setSelectedConversation, removeConversation } from "../redux/conversation.slice";
import { getMessages } from "../features/message.api";
import { setArtifacts, setMessages } from "../redux/message.slice";
  import BillingDrawer from "./BillingDrawer";

export default function Sidebar() {
  const [hovered, setHovered]     = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
 const [imageError,setImageError]=useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { userData, theme } = useSelector(state => state.user);
  const { conversations, selectedConversation } = useSelector(state => state.conversation);
  const dispatch = useDispatch();
const [showBilling, setShowBilling] =useState(false);
  const logout = async () => {
    try {
      await api.get("/api/auth/logout");
      dispatch(setUserData(null));
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteConversation = async (e, conversationId) => {
    e.stopPropagation();
    try {
      await deleteConversation(conversationId);
      dispatch(removeConversation(conversationId));
      if (selectedConversation?._id === conversationId) {
        dispatch(setMessages([]));
        dispatch(setArtifacts([]));
      }
    } catch (error) {
      console.log("Error deleting conversation", error);
    }
  };

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await getConversations();
        dispatch(setConversations(Array.isArray(data) ? data : []));
      } catch (error) {
        console.log(error);
      }
    };
    fetchConversations();
  }, [userData?._id]);

  const handleCreateConversation = async () => {
    try {
      const newConversation = await createConversation();
      dispatch(addConversation(newConversation));
      dispatch(setSelectedConversation(newConversation));
      dispatch(setMessages([]));
      dispatch(setArtifacts([]));
      setMobileOpen(false);
    } catch (error) {
      console.log("Error creating conversation", error);
    }
  };

  const handleSelectConversation = async (conversation) => {
    setMobileOpen(false);
    dispatch(setSelectedConversation(conversation));
    const messages = await getMessages(conversation._id);
    dispatch(setMessages(messages));
     dispatch(setArtifacts(messages.artifacts));
  };

  const PanelIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/>
    </svg>
  );

  /* ── Collapsed rail — desktop only ── */
  const CollapsedRail = () => (
    <div className="hidden lg:flex flex-col items-center w-[56px] h-screen bg-[#0c0d12]/80 backdrop-blur-md border-r border-white/[0.05] py-4 gap-1 shrink-0">
      <button
        onClick={() => setCollapsed(false)}
        className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-colors duration-150 bg-transparent border-none cursor-pointer mb-2"
      >
        <PanelIcon />
      </button>

      {/* Collapsed Rail Miniature Brand Logo */}
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#13151c] to-[#0f1115] border border-white/[0.08] flex items-center justify-center shadow-md mb-3">
        <svg width="15" height="15" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_4px_rgba(99,102,241,0.5)]">
          <path d="M32 3L57 17.5V46.5L32 61L7 46.5V17.5L32 3Z" stroke="url(#sideHexCollapsed)" strokeWidth="1.5" strokeLinejoin="round" opacity="0.35" />
          <path d="M32 3L57 17.5V46.5L32 61" stroke="url(#sideHexCollapsed)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M22 22C22 16.48 26.48 12 32 12C37.52 12 42 16.48 42 22C42 27.52 37.52 32 32 32" stroke="url(#sideCoreCollapsed)" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M42 42C42 47.52 37.52 52 32 52C26.48 52 22 47.52 22 42C22 36.48 26.48 32 32 32" stroke="url(#sideCoreCollapsed)" strokeWidth="4.5" strokeLinecap="round" />
          <circle cx="32" cy="32" r="7" fill="url(#sideInnerCollapsed)" />
          <circle cx="22" cy="22" r="4.5" fill="#22D3EE" />
          <circle cx="42" cy="42" r="4.5" fill="#C084FC" />
          <defs>
            <linearGradient id="sideHexCollapsed" x1="7" y1="3" x2="57" y2="61">
              <stop stopColor="#818CF8" />
              <stop offset="1" stopColor="#22D3EE" />
            </linearGradient>
            <linearGradient id="sideCoreCollapsed" x1="22" y1="12" x2="42" y2="52">
              <stop stopColor="#818CF8" />
              <stop offset="0.5" stopColor="#C084FC" />
              <stop offset="1" stopColor="#818CF8" />
            </linearGradient>
            <linearGradient id="sideInnerCollapsed" x1="27" y1="27" x2="37" y2="37">
              <stop stopColor="#22D3EE" />
              <stop offset="1" stopColor="#818CF8" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <button
        onClick={() => {
          handleCreateConversation();
          setCollapsed(false);
        }}
        className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-colors duration-150 bg-transparent border-none cursor-pointer"
      >
        <Plus size={17} />
      </button>

      <div className="flex-1 flex flex-col items-center gap-1 overflow-y-auto w-full px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden mt-1">
        {Array.isArray(conversations) && conversations.map((chat) => {
          const isActive = selectedConversation?._id === chat._id;
          return (
            <button
              key={chat._id}
              onClick={() => handleSelectConversation(chat)}
              title={chat.title}
              className={`flex items-center justify-center w-9 h-9 rounded-xl transition-colors duration-150 border-none cursor-pointer
                ${isActive ? "bg-indigo-500/15 text-indigo-400" : "bg-transparent text-slate-500 hover:bg-white/[0.05] hover:text-slate-300"}`}
            >
              <MessageSquare size={15} />
            </button>
          );
        })}
      </div>

      <div className="mt-auto relative">
        {userData && (
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            title="Profile Actions"
            className="relative cursor-pointer bg-transparent border-none p-0 outline-none block"
          >
            {userData.avatar
              ? <img src={userData.avatar} alt={userData.name} className="w-8 h-8 rounded-[8px] object-cover border-2 border-indigo-500/25 hover:opacity-80 transition" />
              : <div className="w-8 h-8 rounded-[8px] bg-white/[0.06] flex items-center justify-center hover:bg-white/10 transition"><User size={14} className="text-slate-400" /></div>
            }
            <span className="absolute -bottom-px -right-px w-2 h-2 bg-green-500 rounded-full border-[1.5px] border-[#0d0f14] block" />
          </button>
        )}

        {showProfileMenu && (
          <>
            <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowProfileMenu(false)} />
            <div className="absolute bottom-10 left-3 z-50 w-40 bg-[#13151c] border border-white/[0.08] rounded-xl p-1.5 shadow-2xl flex flex-col gap-0.5">
              <button
                onClick={() => {
                  setShowBilling(true);
                  setShowProfileMenu(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12px] font-medium text-slate-300 hover:text-white hover:bg-white/[0.05] border-none bg-transparent cursor-pointer text-left"
              >
                <CoinsIcon size={13} className="text-yellow-500" />
                Billing
              </button>
              <div className="h-px bg-white/[0.05] my-1" />
              <button
                onClick={() => {
                  logout();
                  setShowProfileMenu(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12px] font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border-none bg-transparent cursor-pointer text-left"
              >
                <LogOut size={13} />
                Log Out
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  /* ── Full sidebar content ── */
  const SidebarContent = () => (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-white/[0.05]">
        {/* Desktop collapse */}
        <button
          onClick={() => setCollapsed(true)}
          className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-colors duration-150 bg-transparent border-none cursor-pointer"
        >
          <PanelIcon />
        </button>

        {/* Mobile close */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-colors duration-150 bg-transparent border-none cursor-pointer"
        >
          <X size={15} />
        </button>

        {/* Miniature Neural Hexagon Logo */}
        <svg width="18" height="18" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_4px_rgba(99,102,241,0.5)] shrink-0">
          <path d="M32 3L57 17.5V46.5L32 61L7 46.5V17.5L32 3Z" stroke="url(#sideHex)" strokeWidth="1.5" strokeLinejoin="round" opacity="0.35" />
          <path d="M32 3L57 17.5V46.5L32 61" stroke="url(#sideHex)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M22 22C22 16.48 26.48 12 32 12C37.52 12 42 16.48 42 22C42 27.52 37.52 32 32 32" stroke="url(#sideCore)" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M42 42C42 47.52 37.52 52 32 52C26.48 52 22 47.52 22 42C22 36.48 26.48 32 32 32" stroke="url(#sideCore)" strokeWidth="4.5" strokeLinecap="round" />
          <circle cx="32" cy="32" r="7" fill="url(#sideInner)" />
          <circle cx="22" cy="22" r="4.5" fill="#22D3EE" />
          <circle cx="42" cy="42" r="4.5" fill="#C084FC" />
          <defs>
            <linearGradient id="sideHex" x1="7" y1="3" x2="57" y2="61">
              <stop stopColor="#818CF8" />
              <stop offset="1" stopColor="#22D3EE" />
            </linearGradient>
            <linearGradient id="sideCore" x1="22" y1="12" x2="42" y2="52">
              <stop stopColor="#818CF8" />
              <stop offset="0.5" stopColor="#C084FC" />
              <stop offset="1" stopColor="#818CF8" />
            </linearGradient>
            <linearGradient id="sideInner" x1="27" y1="27" x2="37" y2="37">
              <stop stopColor="#22D3EE" />
              <stop offset="1" stopColor="#818CF8" />
            </linearGradient>
          </defs>
        </svg>

        <span className="text-[14.5px] font-semibold text-slate-100 tracking-tight flex-1">CortexAI</span>

        <span className="text-[10px] font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full tracking-wide">
         {userData?.plan ?? "pro"}
        </span>

        <button
          onClick={handleCreateConversation}
          className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-colors duration-150 bg-transparent border-none cursor-pointer"
        >
          <PenSquare size={14} />
        </button>
      </div>

      {/* New Chat */}
      <div className="px-4 pt-4 pb-1">
        <button
          onClick={handleCreateConversation}
          className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-white bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 rounded-[14px] py-3.5 border-none cursor-pointer hover:shadow-[0_4px_20px_rgba(99,102,241,0.25)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300"
        >
          <Plus size={15} />
          New Chat
        </button>
      </div>

      {
        conversations.length==0? (
        
            <div className="px-5 pt-4 pb-1.5 text-[10.5px] font-semibold uppercase tracking-widest text-slate-600">
                 No recent conversations
            </div>
          )
        :
        (
             
 <p className="px-5 pt-4 pb-1.5 text-[10.5px] font-semibold uppercase tracking-widest text-slate-600">
        Recents
      </p>

        )
      }

      {/* Section label */}
     
      {/* Chat list */}
      <div className="flex-1 overflow-y-auto px-2.5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {Array.isArray(conversations) && conversations.map((chat) => {
          const isActive = selectedConversation?._id === chat._id;
          const isHov    = hovered === chat._id;
          return (
            <div
              key={chat._id}
              onClick={() => handleSelectConversation(chat)}
              onMouseEnter={() => setHovered(chat._id)}
              onMouseLeave={() => setHovered(null)}
              className={`flex items-center justify-between gap-2.5 cursor-pointer mb-0.5 px-3 py-2.5 transition-all duration-150 border
                ${theme === "neo-glass"
                  ? isActive
                    ? "bg-indigo-500/5 border-l-2 border-l-indigo-500 border-t-transparent border-r-transparent border-b-transparent rounded-r-[10px] pl-[10px]"
                    : isHov
                      ? "bg-white/[0.03] border-transparent rounded-[10px]"
                      : "bg-transparent border-transparent rounded-[10px]"
                  : isActive
                    ? "bg-indigo-500/10 border-indigo-500/[0.18] rounded-[10px]"
                    : isHov
                      ? "bg-white/[0.05] border-transparent rounded-[10px]"
                      : "bg-transparent border-transparent rounded-[10px]"
                }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className={`flex items-center justify-center shrink-0 w-[28px] h-[28px] rounded-lg transition-colors duration-150
                  ${isActive ? "bg-indigo-500/15 text-indigo-400" : "bg-white/[0.05] text-slate-500"}`}>
                  <MessageSquare size={13} />
                </div>
                <p className={`text-[13px] font-medium truncate ${isActive ? "text-slate-100" : "text-slate-300"}`}>
                  {chat.title}
                </p>
              </div>
              
              {(isActive || isHov) && (
                <button
                  onClick={(e) => handleDeleteConversation(e, chat._id)}
                  className="flex items-center justify-center w-6 h-6 rounded-md border-none bg-transparent text-slate-500 hover:text-red-400 hover:bg-white/10 transition-all duration-150 cursor-pointer shrink-0"
                >
                  <Trash size={13} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div className="mx-2.5 h-px bg-white/[0.06]" />

      {/* Footer */}
      <div className="px-4 py-4">
        {userData ? (
          <div className="flex items-center gap-3 bg-white/[0.015] border border-white/[0.04] backdrop-blur-md rounded-2xl p-3 shadow-md hover:bg-white/[0.035] hover:border-white/[0.07] transition-all duration-300">
            <div className="relative shrink-0">
              {
  !userData?.avatar || imageError ? (
    <div className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center">
      <User size={15} className="text-slate-400" />
    </div>
  ) : (
    <img
      src={userData.avatar}
      alt={userData.name}
      className="w-9 h-9 rounded-full object-cover border-2 border-indigo-500/20"
      onError={() => setImageError(true)}
    />
  )
}
              <span className="absolute -bottom-0.5 -right-0.5 w-[10px] h-[10px] bg-emerald-500 rounded-full border-2 border-[#0c0d12] animate-pulse block" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-slate-200 truncate">{userData.name}</p>
              <p className="text-[10px] font-semibold text-indigo-400 tracking-wide uppercase mt-0.5">{userData.plan || "Free Plan"}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button
    onClick={() => setShowBilling(true)}
    className="flex items-center justify-center w-7 h-7 rounded-lg border-none bg-transparent text-yellow-500 cursor-pointer hover:bg-white/[0.08] transition-all duration-150"
    title="Billing & Upgrade"
>
    <CoinsIcon size={15}/>
</button>
              <button onClick={logout} className="flex items-center justify-center w-7 h-7 rounded-lg border-none bg-transparent text-slate-500 cursor-pointer hover:bg-white/[0.08] hover:text-red-400 transition-all duration-150" title="Log Out">
                <LogOut size={13} />
              </button>
            </div>
          </div>
        ) : (
          <div className="px-1">
            <button className="w-full flex items-center justify-center gap-2 text-sm font-medium text-slate-200 bg-white/[0.05] border border-white/[0.08] rounded-xl py-[11px] cursor-pointer hover:bg-white/[0.08] transition-colors duration-150">
              Login
            </button>
          </div>
        )}
      </div>

    </div>
  );

  if (collapsed) {
    return (
      <>
        <CollapsedRail />
        <BillingDrawer
          open={showBilling}
          onClose={() => setShowBilling(false)}
        />
      </>
    );
  }

  return (
    <>
      {/* ── Mobile hamburger ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3.5 left-4 z-50 flex items-center justify-center w-8 h-8 rounded-lg bg-[#0d0f14] border border-white/[0.06] text-slate-400 hover:text-slate-200 transition-colors duration-150 cursor-pointer"
      >
        <Menu size={16} />
      </button>

      {/* ── Mobile backdrop ── */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        />
      )}

      {/* ── Sidebar panel ── */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-[270px] h-screen shrink-0
        bg-[#0c0d12]/85 backdrop-blur-md border-r border-white/[0.05]
        transition-transform duration-250
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <SidebarContent />
      </div>

<BillingDrawer

    open={showBilling}

    onClose={()=>
        setShowBilling(false)
    }

/>
    </>
  );
}