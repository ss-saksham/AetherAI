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
    } catch (error) {
      console.log("Error deleting conversation on server", error);
    } finally {
      // Always remove from local state to keep the UI clean
      dispatch(removeConversation(conversationId));
      if (selectedConversation?._id === conversationId) {
        dispatch(setMessages([]));
        dispatch(setArtifacts([]));
      }
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

  useEffect(() => {
    const handleOpenBilling = () => setShowBilling(true);
    const handleNewChat = () => handleCreateConversation();

    window.addEventListener("open-billing", handleOpenBilling);
    window.addEventListener("create-new-chat", handleNewChat);

    return () => {
      window.removeEventListener("open-billing", handleOpenBilling);
      window.removeEventListener("create-new-chat", handleNewChat);
    };
  }, []);

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
    <div className="hidden lg:flex flex-col items-center w-12 h-screen bg-[#0e0e10] border-r border-white/[0.04] py-4 gap-1 shrink-0">
      <button
        onClick={() => setCollapsed(false)}
        className="flex items-center justify-center w-8 h-8 rounded-lg text-[#71717a] hover:text-[#f4f4f5] hover:bg-white/[0.03] transition-colors duration-150 bg-transparent border-none cursor-pointer mb-2"
      >
        <PanelIcon />
      </button>

      {/* Collapsed Rail Miniature Brand Logo */}
      <div className="w-8 h-8 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center justify-center mb-3">
        <span className="text-xs font-bold text-white font-mono">A</span>
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
      <div className="flex items-center gap-2 px-4 py-4 border-b border-white/[0.04]">
        {/* Desktop collapse */}
        <button
          onClick={() => setCollapsed(true)}
          className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-[#71717a] hover:text-[#f4f4f5] hover:bg-white/[0.03] transition-colors duration-150 bg-transparent border-none cursor-pointer"
        >
          <PanelIcon />
        </button>

        {/* Mobile close */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden flex items-center justify-center w-7 h-7 rounded-lg text-[#71717a] hover:text-[#f4f4f5] hover:bg-white/[0.03] transition-colors duration-150 bg-transparent border-none cursor-pointer"
        >
          <X size={14} />
        </button>

        {/* Miniature Brand Logo */}
        <div className="w-6 h-6 rounded-md bg-white/[0.02] border border-white/[0.06] flex items-center justify-center shrink-0">
          <span className="text-[10px] font-bold text-white font-mono">A</span>
        </div>

        <span className="text-[13px] font-bold text-white tracking-tight flex-1">Aether</span>

        <span className="text-[9px] font-mono text-[#a1a1aa] bg-white/[0.04] border border-white/[0.06] px-1.5 py-0.5 rounded uppercase tracking-wider">
         {userData?.plan ?? "free"}
        </span>

        <button
          onClick={handleCreateConversation}
          className="flex items-center justify-center w-7 h-7 rounded-lg text-[#71717a] hover:text-[#f4f4f5] hover:bg-white/[0.03] transition-colors duration-150 bg-transparent border-none cursor-pointer"
        >
          <PenSquare size={13} />
        </button>
      </div>

      {/* New Chat */}
      <div className="px-4 pt-4 pb-1">
        <button
          onClick={handleCreateConversation}
          className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-white bg-white/[0.02] border border-white/[0.04] rounded-lg py-2.5 cursor-pointer hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-150"
        >
          <Plus size={13} />
          New Workspace
        </button>
      </div>

      {
        conversations.length === 0 ? (
            <div className="px-5 pt-5 pb-1.5 text-[9px] font-bold uppercase tracking-widest text-[#71717a] font-mono">
                 No workspaces
            </div>
          ) : (
            <p className="px-5 pt-5 pb-1.5 text-[9px] font-bold uppercase tracking-widest text-[#71717a] font-mono">
              Workspaces
            </p>
          )
      }

      {/* Section label */}
     
      {/* Chat list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {Array.isArray(conversations) && conversations.map((chat) => {
          const isActive = selectedConversation?._id === chat._id;
          const isHov    = hovered === chat._id;
          return (
            <div
              key={chat._id}
              onClick={() => handleSelectConversation(chat)}
              onMouseEnter={() => setHovered(chat._id)}
              onMouseLeave={() => setHovered(null)}
              className={`flex items-center justify-between gap-2 cursor-pointer mb-0.5 px-3 py-2 transition-colors duration-150 rounded-lg border border-transparent
                ${isActive ? "bg-white/[0.04] text-white" : "text-[#a1a1aa] hover:bg-white/[0.015] hover:text-[#f4f4f5]"}`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <MessageSquare size={12} className={isActive ? "text-white" : "text-[#71717a]"} />
                <p className="text-[12px] font-medium truncate">
                  {chat.title}
                </p>
              </div>
              
              {(isActive || isHov) && (
                <button
                  onClick={(e) => handleDeleteConversation(e, chat._id)}
                  className="flex items-center justify-center w-5 h-5 rounded border-none bg-transparent text-[#71717a] hover:text-red-400 hover:bg-white/5 transition-colors duration-150 cursor-pointer shrink-0"
                >
                  <Trash size={11} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div className="mx-2.5 h-px bg-white/[0.06]" />

      <div className="px-3 py-3 mt-auto">
        {userData ? (
          <div className="flex items-center gap-2.5 bg-[#121214] border border-white/[0.04] rounded-lg p-2.5 shadow-sm hover:bg-[#161619] transition-all duration-150 select-none">
            <div className="relative shrink-0">
              {
                !userData?.avatar || imageError ? (
                  <div className="w-8 h-8 rounded bg-white/[0.04] flex items-center justify-center">
                    <User size={13} className="text-[#71717a]" />
                  </div>
                ) : (
                  <img
                    src={userData.avatar}
                    alt={userData.name}
                    className="w-8 h-8 rounded object-cover border border-white/[0.08]"
                    onError={() => setImageError(true)}
                  />
                )
              }
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-[#121214] block" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11.5px] font-bold text-white truncate">{userData.name}</p>
              <p className="text-[9px] font-mono text-[#71717a] tracking-wider uppercase mt-0.5">{userData.plan || "Free Plan"}</p>
            </div>
            <div className="flex gap-0.5 shrink-0">
              <button
                onClick={() => setShowBilling(true)}
                className="flex items-center justify-center w-6 h-6 rounded text-[#71717a] hover:text-[#f4f4f5] hover:bg-white/[0.03] transition-all duration-150 bg-transparent border-none cursor-pointer"
                title="Billing"
              >
                <CoinsIcon size={12}/>
              </button>
              <button 
                onClick={logout} 
                className="flex items-center justify-center w-6 h-6 rounded text-[#71717a] hover:text-[#f4f4f5] hover:bg-white/[0.03] transition-all duration-150 bg-transparent border-none cursor-pointer" 
                title="Log Out"
              >
                <LogOut size={11} />
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
        w-[220px] h-screen shrink-0
        bg-[#0e0e10] border-r border-white/[0.04]
        transition-transform duration-200
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