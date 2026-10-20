import React, { useState } from 'react'
import { Lock, Eye, EyeOff, ArrowRight, Sun, Moon, Code2, Terminal } from 'lucide-react'
import { useAccess } from '../../context/AccessContext'
import { useTheme } from '../../context/ThemeContext'

export const LoginScreen: React.FC = () => {
  const { loginWithFirebase, continueAsGuest } = useAccess()
  const { theme, toggleTheme } = useTheme()

  // Empty by default — never exposes the owner's email address to guests or readers
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setLoading(true)

    try {
      const success = await loginWithFirebase(email.trim(), password)
      if (!success) {
        setErrorMessage('Authentication failed. Please verify your email and password.')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed'
      setErrorMessage(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen dev-app flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden transition-colors duration-200">
      {/* ─── Animated Tech Background Atmosphere ─── */}
      <div className="absolute inset-0 tech-grid-overlay pointer-events-none opacity-70 dark:opacity-80" />

      {/* Floating Animated Cyber Orbs */}
      <div className="absolute -top-28 -left-28 w-96 h-96 rounded-full bg-gradient-to-br from-[#863bff]/25 via-indigo-600/15 to-transparent blur-[100px] animate-cyber-orb-1 pointer-events-none" />
      <div className="absolute -bottom-28 -right-28 w-[30rem] h-[30rem] rounded-full bg-gradient-to-tl from-cyan-500/15 via-[#863bff]/20 to-transparent blur-[120px] animate-cyber-orb-2 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] rounded-full bg-indigo-500/10 blur-[130px] pointer-events-none" />

      {/* Subtle Horizontal Tech Scan Beam */}
      <div className="absolute left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#863bff]/50 dark:via-[#a975ff]/50 to-transparent animate-scan-beam pointer-events-none" />

      {/* ─── Clean Developer Code Stream: Left Panel (Algorithmic Core) ─── */}
      <div className="hidden xl:block absolute left-8 2xl:left-16 top-1/2 w-80 2xl:w-96 pointer-events-none select-none animate-code-float opacity-35 hover:opacity-75 transition-opacity duration-300">
        <div className="code-fade-mask rounded-2xl bg-white/[0.03] dark:bg-[#0c0d18]/50 backdrop-blur-md border border-black/5 dark:border-white/[0.06] p-5 shadow-2xl font-mono text-[11px] leading-relaxed">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-black/5 dark:border-white/5 text-[10px]">
            <div className="flex items-center gap-2">
              <Code2 className="w-3.5 h-3.5 text-[#863bff]" />
              <span className="text-slate-600 dark:text-slate-300 font-semibold tracking-wide">engine/vault.ts</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#863bff]/10 text-[#863bff] dark:text-[#a975ff] font-semibold">O(1) CACHE</span>
          </div>
          <div className="space-y-1 text-slate-600 dark:text-slate-400">
            <div className="flex gap-3"><span className="text-slate-400 dark:text-slate-600 select-none">01</span><span><span className="text-purple-600 dark:text-purple-400">export class</span> <span className="text-amber-600 dark:text-amber-300">VaultCache</span>&lt;<span className="text-cyan-600 dark:text-cyan-300">T</span>&gt; &#123;</span></div>
            <div className="flex gap-3"><span className="text-slate-400 dark:text-slate-600 select-none">02</span><span>  <span className="text-purple-600 dark:text-purple-400">private</span> store = <span className="text-purple-600 dark:text-purple-400">new</span> <span className="text-blue-600 dark:text-blue-400">Map</span>&lt;string, T&gt;();</span></div>
            <div className="flex gap-3"><span className="text-slate-400 dark:text-slate-600 select-none">03</span><span>  <span className="text-purple-600 dark:text-purple-400">private</span> maxEntries = <span className="text-cyan-600 dark:text-cyan-400">256</span>;</span></div>
            <div className="flex gap-3"><span className="text-slate-400 dark:text-slate-600 select-none">04</span><span></span></div>
            <div className="flex gap-3"><span className="text-slate-400 dark:text-slate-600 select-none">05</span><span>  <span className="text-blue-600 dark:text-blue-400">get</span>(key: string): T | <span className="text-rose-500">null</span> &#123;</span></div>
            <div className="flex gap-3"><span className="text-slate-400 dark:text-slate-600 select-none">06</span><span>    <span className="text-purple-600 dark:text-purple-400">if</span> (!<span className="text-purple-600 dark:text-purple-400">this</span>.store.has(key)) <span className="text-purple-600 dark:text-purple-400">return null</span>;</span></div>
            <div className="flex gap-3"><span className="text-slate-400 dark:text-slate-600 select-none">07</span><span>    <span className="text-purple-600 dark:text-purple-400">const</span> entry = <span className="text-purple-600 dark:text-purple-400">this</span>.store.get(key)!;</span></div>
            <div className="flex gap-3"><span className="text-slate-400 dark:text-slate-600 select-none">08</span><span>    <span className="text-purple-600 dark:text-purple-400">this</span>.touch(key, entry);</span></div>
            <div className="flex gap-3"><span className="text-slate-400 dark:text-slate-600 select-none">09</span><span>    <span className="text-purple-600 dark:text-purple-400">return</span> entry;</span></div>
            <div className="flex gap-3"><span className="text-slate-400 dark:text-slate-600 select-none">10</span><span>  &#125;</span></div>
            <div className="flex gap-3"><span className="text-slate-400 dark:text-slate-600 select-none">11</span><span></span></div>
            <div className="flex gap-3"><span className="text-slate-400 dark:text-slate-600 select-none">12</span><span>  <span className="text-slate-400 dark:text-slate-500">// Zero-latency LRU eviction</span></span></div>
            <div className="flex gap-3"><span className="text-slate-400 dark:text-slate-600 select-none">13</span><span>  <span className="text-blue-600 dark:text-blue-400">touch</span>(k: string, v: T): <span className="text-rose-500">void</span> &#123;</span></div>
            <div className="flex gap-3"><span className="text-slate-400 dark:text-slate-600 select-none">14</span><span>    <span className="text-purple-600 dark:text-purple-400">this</span>.store.delete(k);</span></div>
            <div className="flex gap-3"><span className="text-slate-400 dark:text-slate-600 select-none">15</span><span>    <span className="text-purple-600 dark:text-purple-400">this</span>.store.set(k, v);</span></div>
            <div className="flex gap-3"><span className="text-slate-400 dark:text-slate-600 select-none">16</span><span>  &#125;</span></div>
            <div className="flex gap-3"><span className="text-slate-400 dark:text-slate-600 select-none">17</span><span>&#125;</span></div>
          </div>
        </div>
      </div>

      {/* ─── Clean Developer Code Stream: Right Panel (Cloud Storage Core) ─── */}
      <div className="hidden xl:block absolute right-8 2xl:right-16 top-1/2 w-80 2xl:w-96 pointer-events-none select-none animate-code-float-reverse opacity-35 hover:opacity-75 transition-opacity duration-300">
        <div className="code-fade-mask rounded-2xl bg-white/[0.03] dark:bg-[#0c0d18]/50 backdrop-blur-md border border-black/5 dark:border-white/[0.06] p-5 shadow-2xl font-mono text-[11px] leading-relaxed">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-black/5 dark:border-white/5 text-[10px]">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-cyan-500" />
              <span className="text-slate-600 dark:text-slate-300 font-semibold tracking-wide">storage/firestore.ts</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">SPARK ₹0</span>
          </div>
          <div className="space-y-1 text-slate-600 dark:text-slate-400">
            <div className="flex gap-3"><span className="text-slate-400 dark:text-slate-600 select-none">01</span><span><span className="text-purple-600 dark:text-purple-400">export async function</span> <span className="text-blue-600 dark:text-blue-400">syncVault</span>() &#123;</span></div>
            <div className="flex gap-3"><span className="text-slate-400 dark:text-slate-600 select-none">02</span><span>  <span className="text-purple-600 dark:text-purple-400">const</span> snapshot = <span className="text-purple-600 dark:text-purple-400">await</span> getDocs(</span></div>
            <div className="flex gap-3"><span className="text-slate-400 dark:text-slate-600 select-none">03</span><span>    collection(db, <span className="text-emerald-600 dark:text-emerald-400">'users'</span>, uid, <span className="text-emerald-600 dark:text-emerald-400">'vault'</span>)</span></div>
            <div className="flex gap-3"><span className="text-slate-400 dark:text-slate-600 select-none">04</span><span>  );</span></div>
            <div className="flex gap-3"><span className="text-slate-400 dark:text-slate-600 select-none">05</span><span></span></div>
            <div className="flex gap-3"><span className="text-slate-400 dark:text-slate-600 select-none">06</span><span>  <span className="text-slate-400 dark:text-slate-500">// Read-only public access stream</span></span></div>
            <div className="flex gap-3"><span className="text-slate-400 dark:text-slate-600 select-none">07</span><span>  <span className="text-purple-600 dark:text-purple-400">const</span> records = snapshot.docs.map(d =&gt; (&#123;</span></div>
            <div className="flex gap-3"><span className="text-slate-400 dark:text-slate-600 select-none">08</span><span>    id: d.id,</span></div>
            <div className="flex gap-3"><span className="text-slate-400 dark:text-slate-600 select-none">09</span><span>    ...d.data(),</span></div>
            <div className="flex gap-3"><span className="text-slate-400 dark:text-slate-600 select-none">10</span><span>    verified: <span className="text-purple-600 dark:text-purple-400">true</span></span></div>
            <div className="flex gap-3"><span className="text-slate-400 dark:text-slate-600 select-none">11</span><span>  &#125;));</span></div>
            <div className="flex gap-3"><span className="text-slate-400 dark:text-slate-600 select-none">12</span><span></span></div>
            <div className="flex gap-3"><span className="text-slate-400 dark:text-slate-600 select-none">13</span><span>  <span className="text-purple-600 dark:text-purple-400">return</span> records.sort(byDate);</span></div>
            <div className="flex gap-3"><span className="text-slate-400 dark:text-slate-600 select-none">14</span><span>&#125;</span></div>
          </div>
        </div>
      </div>

      {/* Top Right Theme Toggle */}
      <div className="absolute top-5 right-6 z-20 flex items-center gap-3">
        <button
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          className="p-2 rounded-xl bg-white/80 dark:bg-[#1A1C28]/80 backdrop-blur-md border border-[#E9EAF0] dark:border-[#2A2C3E] text-[#777B8A] dark:text-[#9497A8] hover:text-[#20212A] dark:hover:text-[#F1F2F6] transition-all cursor-pointer shadow-sm hover:scale-105"
          title="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-500" />
          )}
        </button>
      </div>

      <div className="w-full max-w-md animate-fade-in space-y-6 relative z-10">
        {/* Brand Header with Lightning Logo */}
        <div className="text-center space-y-2">
          <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#863bff]/15 to-indigo-600/10 border border-[#863bff]/30 shadow-lg shadow-[#863bff]/20 mb-2 group">
            <div className="absolute inset-0 rounded-2xl bg-[#863bff]/20 blur-md animate-tech-pulse" />
            <img
              src="/favicon.svg"
              alt="DevVault Lightning Logo"
              className="w-9 h-9 object-contain relative z-10 drop-shadow-[0_0_12px_rgba(134,59,255,0.8)] group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#20212A] dark:text-[#F1F2F6]">
            DevVault
          </h1>
          <p className="text-xs font-mono font-medium text-[#863bff] dark:text-[#a975ff] tracking-wider uppercase">
            Saravanan Tech Diary
          </p>
        </div>

        {/* Glassmorphic Cyber Card with Gradient Border */}
        <div className="relative p-[1px] rounded-2xl bg-gradient-to-b from-[#863bff]/35 via-indigo-500/15 to-transparent shadow-2xl shadow-[#863bff]/10">
          <div className="dev-card p-6 sm:p-7 rounded-2xl bg-white/95 dark:bg-[#141522]/95 backdrop-blur-xl border border-white/20 dark:border-white/5">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#E9EAF0] dark:border-[#262838] text-[#863bff] dark:text-[#a975ff]">
              <Lock className="w-4 h-4" />
              <h2 className="font-bold text-sm text-[#20212A] dark:text-[#F1F2F6]">
                Owner Sign In
              </h2>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400 text-xs font-medium animate-fade-in">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#777B8A] dark:text-[#9497A8] mb-1.5">
                  Owner Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter owner email..."
                  autoComplete="username"
                  required
                  className="dev-input w-full px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#777B8A] dark:text-[#9497A8]">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your vault password..."
                    autoComplete="current-password"
                    required
                    autoFocus
                    className="dev-input w-full px-3.5 py-2.5 text-sm font-mono pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-2.5 px-4 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all shadow-md hover:shadow-indigo-500/25 hover:scale-[1.01]"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Unlock DevVault</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Quick Guest Reader Entry */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={continueAsGuest}
                  className="text-xs text-[#777B8A] dark:text-[#9497A8] hover:text-[#863bff] dark:hover:text-[#a975ff] transition-colors cursor-pointer inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Continue as Guest (Read-Only)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
