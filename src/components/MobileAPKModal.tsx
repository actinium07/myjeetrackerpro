import React, { useState } from 'react';
import { Smartphone, Download, Check, Apple, Sparkles, X, ShieldCheck, Terminal, Copy, ExternalLink, Zap, Layers } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface MobileAPKModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileAPKModal: React.FC<MobileAPKModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'ANDROID' | 'IOS' | 'CLI_APK'>('ANDROID');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyText = (txt: string, key: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedCmd(key);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const downloadAndroidBundle = () => {
    const manifestJson = {
      package_id: "com.jee2027.trackprep",
      name: "JEE 2027 TrackPrep & AI Solver",
      short_name: "JEE 2027",
      start_url: "/",
      display: "standalone",
      orientation: "portrait",
      theme_color: "#020617",
      background_color: "#020617",
      app_version: "1.0.0",
      version_code: 1,
      min_sdk_version: 22,
      target_sdk_version: 34,
      permissions: [
        "android.permission.INTERNET",
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO",
        "android.permission.ACCESS_NETWORK_STATE"
      ]
    };

    const blob = new Blob([JSON.stringify(manifestJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jee2027-android-apk-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
                <span>Universal Mobile App Installer</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Android APK & iOS IPA
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Install directly on any phone/tablet without app store delays or generate standalone packages.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 sm:px-6">
          <button
            onClick={() => setActiveTab('ANDROID')}
            className={`py-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'ANDROID'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Android (APK / WebAPK)</span>
          </button>

          <button
            onClick={() => setActiveTab('IOS')}
            className={`py-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'IOS'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Apple className="w-4 h-4 text-cyan-400" />
            <span>iOS (iPhone & iPad)</span>
          </button>

          <button
            onClick={() => setActiveTab('CLI_APK')}
            className={`py-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'CLI_APK'
                ? 'border-purple-400 text-purple-300 bg-purple-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4 text-purple-400" />
            <span>Capacitor / Build Script</span>
          </button>
        </div>

        {/* Body content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 scrollbar-thin">
          {/* ANDROID TAB */}
          {activeTab === 'ANDROID' && (
            <div className="space-y-4">
              <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-bold text-sm text-emerald-200">
                      Method 1: Instant 1-Click Android WebAPK Install
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    Recommended
                  </span>
                </div>
                <p className="text-xs text-emerald-200/80 leading-relaxed">
                  Android devices automatically generate an official signed <strong>WebAPK</strong> package. It launches in full standalone fullscreen mode with high performance, camera permissions for PrepAI question snapping, and offline test recovery.
                </p>

                <div className="pt-2">
                  {isInstalled ? (
                    <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-300 flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      <span>App already installed on this device! Check your home screen.</span>
                    </div>
                  ) : isInstallable ? (
                    <button
                      onClick={install}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-95"
                    >
                      <Download className="w-4 h-4" />
                      <span>Install JEE 2027 App to Android Device Now</span>
                    </button>
                  ) : (
                    <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 text-xs text-slate-300">
                      <p className="font-semibold text-white">Manual Android Install Step:</p>
                      <ol className="list-decimal list-inside space-y-1 text-slate-400">
                        <li>Open this URL in Chrome / Samsung Internet on your Android phone.</li>
                        <li>Tap the <strong>three dots (⋮)</strong> at top-right or bottom bar.</li>
                        <li>Select <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.</li>
                        <li>An official APK icon with splash screen will be pinned to your device!</li>
                      </ol>
                    </div>
                  )}
                </div>
              </div>

              {/* Method 2: Offline Configuration & Manifest Bundle */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-400" />
                    <h3 className="font-bold text-xs text-white">
                      Method 2: Download Android TWA Package Metadata
                    </h3>
                  </div>
                  <button
                    onClick={downloadAndroidBundle}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Config</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Export Android configuration (`twa-manifest.json` and permissions bundle) for compiling directly via Android Studio or Google Bubblewrap.
                </p>
              </div>
            </div>
          )}

          {/* IOS TAB */}
          {activeTab === 'IOS' && (
            <div className="space-y-4">
              <div className="bg-cyan-950/30 border border-cyan-500/30 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Apple className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-bold text-sm text-cyan-200">
                    Install on iPhone / iPad (iOS Safari Standalone)
                  </h3>
                </div>
                <p className="text-xs text-cyan-200/80 leading-relaxed">
                  Apple iOS natively runs progressive web apps in isolated standalone containers without browser address bars:
                </p>

                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                    <span>Open this website inside <strong>Safari</strong> on your iPhone or iPad.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                    <span>Tap the <strong>Share</strong> button (the square with an arrow pointing up) in the bottom toolbar.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                    <span>Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[11px]">4</span>
                    <span>Confirm the title <strong>JEE 2027</strong> and tap <strong>Add</strong> in the top-right corner.</span>
                  </div>
                </div>

                <div className="text-[11px] text-cyan-300/80 flex items-center gap-1.5 pt-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Configured with 180x180 Apple Touch Icons and dark status bar automatically.</span>
                </div>
              </div>
            </div>
          )}

          {/* CLI & CAPACITOR APK TAB */}
          {activeTab === 'CLI_APK' && (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs text-white flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-purple-400" />
                    Compile to Native Android .APK via Capacitor CLI
                  </h3>
                  <button
                    onClick={() => copyText(`npm run build\nnpx cap sync\nnpx cap open android`, 'cap')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
                  >
                    {copiedCmd === 'cap' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCmd === 'cap' ? 'Copied' : 'Copy Commands'}</span>
                  </button>
                </div>

                <pre className="p-3 bg-slate-900 rounded-xl text-xs font-mono text-purple-300 overflow-x-auto">
{`# 1. Build the production bundle
npm run build

# 2. Add Android native platform (Capacitor)
npx cap add android

# 3. Synchronize assets to native Android folder
npx cap sync android

# 4. Generate debug APK or open Android Studio
cd android && ./gradlew assembleDebug

# Output APK path:
# android/app/build/outputs/apk/debug/app-debug.apk`}
                </pre>
              </div>

              {/* Bubblewrap CLI Option */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs text-white flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-400" />
                    Alternative: Google Bubblewrap (Direct Play Store / APK)
                  </h3>
                  <button
                    onClick={() => copyText(`npx @bubblewrap/cli init --manifest=https://your-domain.app/manifest.webmanifest\nnpx @bubblewrap/cli build`, 'bubble')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
                  >
                    {copiedCmd === 'bubble' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCmd === 'bubble' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <pre className="p-3 bg-slate-900 rounded-xl text-xs font-mono text-amber-300 overflow-x-auto">
{`# Google's official CLI tool that converts PWA to native APK
npx @bubblewrap/cli init --manifest=http://localhost:3000/manifest.webmanifest
npx @bubblewrap/cli build`}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Fully offline compatible across all Android & iOS devices</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
