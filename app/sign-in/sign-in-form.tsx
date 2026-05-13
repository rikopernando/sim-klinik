"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, User, Lock, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { signIn } from "@/lib/auth-client"

const ErrorIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 15 15"
    fill="none"
    style={{ marginTop: 1, flexShrink: 0 }}
  >
    <circle cx="7.5" cy="7.5" r="7" stroke="#b91c1c" strokeWidth="1.5" />
    <path d="M7.5 4.5V8" stroke="#b91c1c" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="7.5" cy="10.5" r="0.75" fill="#b91c1c" />
  </svg>
)

export function SignInForm() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    try {
      const result = await signIn.username({ username, password })
      if (result?.error) {
        setError("Username atau password salah. Periksa kembali kredensial Anda.")
      } else {
        toast.success("Selamat datang kembali!", {
          description: "Anda berhasil masuk ke sistem.",
        })
        router.push("/dashboard")
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="sk-right">
      <div className="sk-glow-tl" />
      <div className="sk-glow-br" />

      <div className="sk-form-wrap">
        {/* Mobile brand — shown when left panel is hidden */}
        <div className="sk-mobile-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/bumi-andalas-logo.jpg" alt="Klinik Bumi Andalas" className="sk-mobile-logo" />
          <span className="sk-mobile-name">Klinik Bumi Andalas</span>
        </div>

        <p className="sk-kicker">Portal Staf</p>
        <h2 className="sk-title">Selamat datang</h2>
        <p className="sk-desc">Masuk untuk melanjutkan pekerjaan Anda hari ini.</p>

        <div className="sk-card">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="sk-error">
                <ErrorIcon />
                {error}
              </div>
            )}

            <div className="sk-field">
              <label className="sk-label" htmlFor="username">
                Username
              </label>
              <div className="sk-input-wrap">
                <User className="sk-input-icon" size={15} />
                <input
                  id="username"
                  className="sk-input"
                  type="text"
                  placeholder="Masukkan username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="sk-field" style={{ marginBottom: 0 }}>
              <label className="sk-label" htmlFor="password">
                Password
              </label>
              <div className="sk-input-wrap">
                <Lock className="sk-input-icon" size={15} />
                <input
                  id="password"
                  className="sk-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: "2.5rem" }}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="sk-eye"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="sk-divider" />

            <button type="submit" className="sk-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 size={16} style={{ animation: "sk-spin 1s linear infinite" }} />
                  Memverifikasi…
                </>
              ) : (
                "Masuk ke Sistem"
              )}
            </button>
          </form>
        </div>

        <p className="sk-footer">
          Butuh akses? <a href="#">Hubungi administrator sistem</a>
        </p>
      </div>
    </div>
  )
}
