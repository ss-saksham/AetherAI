import { AnimatePresence, motion } from "framer-motion";
import { X, Crown, Zap } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { createOrder } from "../features/billing.api";
import api from "../utils/axios";
import { setUserData } from "../redux/user.slice";

export default function BillingDrawer({ open, onClose }) {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  const handleUpgrade = async (plan) => {
    try {
      const data = await createOrder(plan);
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "CortexAI",
        description: `${data.plan.name} Plan`,
        order_id: data.order.id,
        handler: async (response) => {
          try {
            await api.post("/api/billing/verify-payment", response);
            const { data: profileData } = await api.get("/api/me");
            dispatch(setUserData(profileData.user));
          } catch (error) {
            console.log(error);
          }
        },
        theme: {
          color: "#0a0a0b",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
          />

          {/* Drawer Container */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed right-0 top-0 z-50 h-screen w-[340px] bg-[#0e0e10] border-l border-white/[0.04] shadow-2xl flex flex-col select-none"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/[0.04]">
              <div>
                <h2 className="text-white text-[14px] font-bold tracking-tight">
                  Billing & Workspace
                </h2>
                <p className="text-[#71717a] text-[11px] font-mono uppercase tracking-wider mt-0.5">
                  Plans & credits
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-7 h-7 rounded-md bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] flex items-center justify-center cursor-pointer text-[#71717a] hover:text-[#f4f4f5] transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Current Active Plan Widget */}
            <div className="p-5">
              <div className="rounded-xl bg-[#121214] border border-white/[0.04] p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[#71717a] text-[10px] font-mono tracking-wider uppercase">
                      Active Subscription
                    </p>
                    <h3 className="text-white text-base font-bold tracking-tight mt-1">
                      {userData?.plan ?? "Free Plan"}
                    </h3>
                  </div>
                  <Crown size={15} className="text-[#a1a1aa]" />
                </div>

                <div className="mt-5">
                  <div className="flex justify-between text-[11px] font-mono text-[#71717a] mb-1.5">
                    <span>Usage Balance</span>
                    <span>
                      {userData?.credits || 0} / {userData?.totalCredits || 0}
                    </span>
                  </div>

                  <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-500"
                      style={{
                        width: `${
                          ((userData?.credits || 0) / (userData?.totalCredits || 1)) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Plans List */}
            <div className="px-5 flex-1 overflow-y-auto space-y-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {/* Starter Plan */}
              <div className="rounded-xl bg-[#121214]/40 border border-white/[0.04] p-4 flex flex-col">
                <div className="flex justify-between items-start">
                  <h3 className="text-white text-[13px] font-bold tracking-tight">Starter</h3>
                </div>
                <p className="text-white text-lg font-bold mt-2">₹199</p>
                <p className="text-[#71717a] text-[10.5px] font-mono mt-0.5">500 Credits balance</p>
                <button
                  className="mt-4 w-full rounded-md bg-[#121214] hover:bg-white/[0.02] border border-white/[0.08] py-2 text-white text-[11.5px] font-semibold cursor-pointer transition-colors"
                  onClick={() => handleUpgrade("starter")}
                >
                  Purchase Plan
                </button>
              </div>

              {/* Pro Plan */}
              <div className="rounded-xl bg-[#121214]/45 border border-white/[0.08] p-4 flex flex-col relative">
                <span className="absolute right-4 top-4 text-[9px] font-mono text-white bg-white/[0.04] border border-white/[0.08] px-1.5 py-0.5 rounded uppercase tracking-wider">
                  Popular
                </span>

                <div className="flex items-center gap-1.5">
                  <h3 className="text-white text-[13px] font-bold tracking-tight">Pro</h3>
                  <Zap size={11} className="text-[#a1a1aa]" />
                </div>
                <p className="text-white text-lg font-bold mt-2">₹499</p>
                <p className="text-[#71717a] text-[10.5px] font-mono mt-0.5">1000 Credits balance</p>
                
                <button
                  className="mt-4 w-full rounded-md bg-[#f4f4f5] hover:bg-white py-2 text-[#09090b] text-[11.5px] font-bold cursor-pointer transition-colors border-none"
                  onClick={() => handleUpgrade("pro")}
                >
                  Upgrade Now
                </button>
              </div>
            </div>

            {/* Price Disclaimer */}
            <div className="p-5 border-t border-white/[0.04]">
              <p className="text-[10px] font-mono text-[#52525b] leading-normal">
                Credits verify compute usage across PDF extraction, PPT compilations, and LLM reasoning.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}