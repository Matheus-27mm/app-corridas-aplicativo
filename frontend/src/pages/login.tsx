import { Car, Eye, EyeOff, Lock, Mail, User } from 'lucide-react'
import { type FormEvent, type InputHTMLAttributes, type ReactNode, useState } from 'react'
import { Navigate } from 'react-router-dom'

import { AppleIcon, GoogleIcon } from '@/components/brand-icons'
import { Switch } from '@/components/ui/switch'
import { type Provedor, useAuth } from '@/store/auth'

type Modo = 'entrar' | 'criar'

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  icon: ReactNode
  right?: ReactNode
}

function Field({ icon, right, ...props }: FieldProps) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.06] px-3 transition-colors focus-within:border-white/40">
      <span className="text-white/55">{icon}</span>
      <input
        {...props}
        autoCorrect="off"
        className="h-11 flex-1 bg-transparent text-white outline-none placeholder:text-white/45"
      />
      {right}
    </div>
  )
}

export function LoginPage() {
  const user = useAuth((s) => s.user)
  const loading = useAuth((s) => s.loading)
  const signInWithEmail = useAuth((s) => s.signInWithEmail)
  const signUpWithEmail = useAuth((s) => s.signUpWithEmail)
  const signInWithProvider = useAuth((s) => s.signInWithProvider)

  const [modo, setModo] = useState<Modo>('entrar')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [verPassword, setVerPassword] = useState(false)
  const [lembrar, setLembrar] = useState(true)

  if (user) return <Navigate to="/" replace />

  const podeAvancar =
    modo === 'entrar'
      ? email.trim().length > 0 && password.length > 0
      : nome.trim().length > 0 && email.trim().length > 0 && password.length >= 6

  function avancar(e: FormEvent) {
    e.preventDefault()
    if (!podeAvancar) return
    if (modo === 'entrar') signInWithEmail(email, password)
    else signUpWithEmail(nome, email, password)
  }

  function entrarCom(provedor: Provedor) {
    signInWithProvider(provedor)
  }

  return (
    <div className="relative min-h-svh w-full overflow-hidden bg-black">
      <video
        className="absolute inset-0 size-full object-cover"
        src="/povdriving.mp4"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/90" />

      <div className="relative flex min-h-svh items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-3xl border border-white/12 bg-black/45 p-6 backdrop-blur-xl">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-white text-black shadow-lg shadow-black/40">
              <Car className="size-7" strokeWidth={2.2} />
            </div>
            <p className="text-[11px] font-bold tracking-[0.3em] text-white/60">GESTRUN</p>
            <h1 className="mt-1 text-2xl font-bold text-white">
              {modo === 'entrar' ? 'Bem-vindo de volta' : 'Cria a tua conta'}
            </h1>
            <p className="mt-1 text-sm text-white/60">Gere os teus ganhos e custos ao volante.</p>
          </div>

          <form onSubmit={avancar} className="space-y-3">
            {modo === 'criar' ? (
              <Field
                icon={<User className="size-[18px]" />}
                placeholder="Nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                autoCapitalize="words"
              />
            ) : null}

            <Field
              icon={<Mail className="size-[18px]" />}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Field
              icon={<Lock className="size-[18px]" />}
              type={verPassword ? 'text' : 'password'}
              placeholder="Palavra-passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              right={
                <button
                  type="button"
                  onClick={() => setVerPassword((v) => !v)}
                  className="text-white/55 hover:text-white"
                  aria-label={verPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
                >
                  {verPassword ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
                </button>
              }
            />

            {modo === 'criar' ? (
              <p className="px-1 text-xs text-white/45">Mínimo 6 caracteres.</p>
            ) : null}

            {modo === 'entrar' ? (
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-sm text-white/70">
                  <Switch checked={lembrar} onCheckedChange={setLembrar} />
                  Lembrar-me
                </label>
                <button type="button" className="text-sm text-white/70 hover:text-white">
                  Esqueceste-te?
                </button>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={!podeAvancar || loading}
              className="mt-1 w-full rounded-xl bg-white py-3 font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-45 flex items-center justify-center gap-2"
            >
              {loading ? 'A carregar...' : (modo === 'entrar' ? 'Entrar' : 'Criar conta')}
            </button>
          </form>

          <div className="my-5 flex items-center gap-2">
            <div className="h-px flex-1 bg-white/15" />
            <span className="text-xs text-white/50">ou continua com</span>
            <div className="h-px flex-1 bg-white/15" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => entrarCom('google')}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              <GoogleIcon className="size-4" /> Google
            </button>
            <button
              type="button"
              onClick={() => entrarCom('apple')}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              <AppleIcon className="size-4" /> Apple
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-white/60">
            {modo === 'entrar' ? 'Não tens conta? ' : 'Já tens conta? '}
            <button
              type="button"
              onClick={() => setModo(modo === 'entrar' ? 'criar' : 'entrar')}
              className="font-semibold text-white"
            >
              {modo === 'entrar' ? 'Criar conta' : 'Entrar'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
