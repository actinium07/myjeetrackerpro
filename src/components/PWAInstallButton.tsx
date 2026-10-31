import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, Apple } from 'lucide-react';

interface PWAInstallButtonProps {
  onOpenModal: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ onOpenModal }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  // If already installed as an APK or standalone, show status pill
  if (isInstalled) {
    return (
      <button
        onClick={onOpenModal}
        className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
        <span>Mobile App Installed</span>
      </button>
    );
  }

  // If Chrome / Android install prompt is ready
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-extrabold shadow-md shadow-emerald-500/20 transition-all transform active:scale-95"
      >
        <Download className="w-3.5 h-3.5 fill-slate-950" />
        <span>Install APK</span>
      </button>
    );
  }

  // Universal button leading to the Mobile APK & iOS Install Hub
  return (
    <button
      onClick={onOpenModal}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all"
    >
      <Smartphone className="w-3.5 h-3.5 text-amber-400" />
      <span>Install APK / iOS</span>
    </button>
  );
};
