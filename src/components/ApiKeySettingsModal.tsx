import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Key, ShieldCheck, X, CheckCircle2, AlertTriangle, ExternalLink, RefreshCw } from 'lucide-react';

interface ApiKeySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCustomKey: (key: string) => void;
}

export const ApiKeySettingsModal: React.FC<ApiKeySettingsModalProps> = ({
  isOpen,
  onClose,
  onSaveCustomKey,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [hasServerKey, setHasServerKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/config')
        .then((res) => res.json())
        .then((data) => {
          setHasServerKey(Boolean(data.hasEnvKey));
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestKey = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKeyInput || undefined }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setTestResult({
          success: true,
          message: 'Connection verified! Gemini Live & models are ready.',
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Failed to authenticate with Gemini API.',
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network test error';
      setTestResult({
        success: false,
        message: msg,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    if (apiKeyInput.trim()) {
      onSaveCustomKey(apiKeyInput.trim());
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md rounded-2xl bg-slate-950 border border-cyan-500/30 p-6 shadow-2xl text-slate-100"
        >
          {/* Close button */}
          <button
            id="close-api-modal-btn"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 tracking-wide">
                Gemini API Key Setup
              </h2>
              <p className="text-xs text-cyan-400/70 font-mono">
                Real-Time Voice Pipeline & Live API
              </p>
            </div>
          </div>

          {/* Server status pill */}
          <div className="mb-4 p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck
                className={`w-4 h-4 ${hasServerKey ? 'text-emerald-400' : 'text-amber-400'}`}
              />
              <span className="text-slate-300">
                Server Environment Key:
              </span>
            </div>
            {hasServerKey ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-[11px]">
                Configured & Active
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-[11px]">
                Not Found
              </span>
            )}
          </div>

          {/* Input field */}
          <div className="space-y-2 mb-4">
            <label className="text-xs font-semibold text-slate-300 block">
              Override or Provide API Key
            </label>
            <input
              id="gemini-api-key-input"
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder={hasServerKey ? 'Using server key (or paste override)' : 'AIzaSy...'}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:outline-none text-xs font-mono text-cyan-100 placeholder-slate-500"
            />
            <p className="text-[11px] text-slate-400">
              Your API key is transmitted securely to the server to establish real-time voice streaming with Gemini Live.
            </p>
          </div>

          {/* Test connection result */}
          {testResult && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-4 p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                testResult.success
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-500/30 text-rose-200'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="text-[11px] leading-relaxed">
                {testResult.message}
              </div>
            </motion.div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              id="test-api-key-btn"
              onClick={handleTestKey}
              disabled={testing}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Testing...' : 'Test Key'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                id="cancel-api-key-btn"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl bg-transparent hover:bg-slate-800/40 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="save-api-key-btn"
                onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
              >
                Apply Key
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
