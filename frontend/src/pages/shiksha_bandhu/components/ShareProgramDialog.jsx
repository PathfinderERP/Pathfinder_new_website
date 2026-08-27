import React, { useState } from "react";
import { XMarkIcon, ClipboardDocumentIcon, CheckIcon } from "@heroicons/react/24/outline";
import { FaWhatsapp, FaTelegramPlane, FaFacebookF, FaTwitter } from "react-icons/fa";
import { referralLink } from "../ShikshaBandhuData";

export const ShareProgramDialog = ({ program, referralId, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!program) return null;

  const link = referralLink(referralId, program.slug);

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const encodedText = encodeURIComponent(`Check out ${program.name} on Pathfinder Institute with checked answer scripts & topper guidance: ${link}`);
  const whatsappUrl = `https://wa.me/?text=${encodedText}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(program.name)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
            {program.board} • {program.className}
          </span>
          <h3 className="text-xl font-black text-slate-900 mt-2">{program.name}</h3>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Share this program with your unique referral link. Every successful referral will be tracked automatically.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Your Referral Link</label>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2">
            <input
              type="text"
              readOnly
              value={link}
              className="w-full bg-transparent text-xs font-mono font-bold text-slate-700 focus:outline-none px-2 truncate"
            />
            <button
              onClick={handleCopy}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-lg flex items-center gap-1 shrink-0 transition"
            >
              {copied ? (
                <>
                  <CheckIcon className="w-4 h-4 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <ClipboardDocumentIcon className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Share Directly</label>
          <div className="grid grid-cols-4 gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="py-2.5 px-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm"
              title="Share on WhatsApp"
            >
              <FaWhatsapp className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
            <a
              href={telegramUrl}
              target="_blank"
              rel="noreferrer"
              className="py-2.5 px-2 bg-[#0088cc] hover:bg-[#0077b3] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm"
              title="Share on Telegram"
            >
              <FaTelegramPlane className="w-4 h-4" />
              <span>Telegram</span>
            </a>
            <a
              href={facebookUrl}
              target="_blank"
              rel="noreferrer"
              className="py-2.5 px-2 bg-[#1877F2] hover:bg-[#1565d8] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm"
              title="Share on Facebook"
            >
              <FaFacebookF className="w-3.5 h-3.5" />
              <span>Facebook</span>
            </a>
            <a
              href={twitterUrl}
              target="_blank"
              rel="noreferrer"
              className="py-2.5 px-2 bg-[#1DA1F2] hover:bg-[#0c85d0] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm"
              title="Share on Twitter / X"
            >
              <FaTwitter className="w-4 h-4" />
              <span>Twitter</span>
            </a>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3 text-[11px] font-bold text-amber-900 text-center">
          ⚡ Tracked Referral ID: <span className="font-mono text-amber-950 font-black">{referralId}</span>
        </div>
      </div>
    </div>
  );
};
