import { AtSign, Calendar, Eye, EyeOff, Lock, Mail, User } from 'lucide-react'
import { type FormEvent, type InputHTMLAttributes, type ReactNode, useState } from 'react'
import { Navigate } from 'react-router-dom'

import { AppleIcon, GestRunLogo, GoogleIcon } from '@/components/brand-icons'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/store/auth'

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
  const signIn = useAuth((s) => s.signIn)
  const signUp = useAuth((s) => s.signUp)

  const [modo, setModo] = useState<Modo>('entrar')

  // Login
  const [loginId, setLoginId] = useState('')

  // Registo
  const [primeiroNome, setPrimeiroNome] = useState('')
  const [sobrenome, setSobrenome] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')

  // Comum
  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [verPassword, setVerPassword] = useState(false)
  const [lembrar, setLembrar] = useState(true)

  if (user) return <Navigate to="/" replace />

  const senhasIguais = password === confirmar
  const podeAvancar =
    modo === 'entrar'
      ? loginId.trim().length > 0 && password.length > 0
      : primeiroNome.trim().length > 0 &&
        sobrenome.trim().length > 0 &&
        username.trim().length > 0 &&
        email.trim().length > 0 &&
        dataNascimento.length > 0 &&
        password.length >= 6 &&
        senhasIguais

  async function avancar(e: FormEvent) {
    e.preventDefault()
    if (!podeAvancar || loading) return
    try {
      if (modo === 'entrar') {
        await signIn(loginId.trim(), password)
      } else {
        await signUp({
          username: username.trim(),
          primeiroNome: primeiroNome.trim(),
          sobrenome: sobrenome.trim(),
          email: email.trim(),
          dataNascimento,
          password,
        })
      }
    } catch {
      // erro já tratado no store (toast)
    }
  }

  const eyeToggle = (
    <button
      type="button"
      onClick={() => setVerPassword((v) => !v)}
      className="text-white/55 hover:text-white"
      aria-label={verPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
    >
      {verPassword ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
    </button>
  )

  return (
    <div className="relative min-h-svh w-full overflow-hidden bg-black">
      <video
        className="fixed inset-0 size-full object-cover"
        src="/povdriving.mp4"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="fixed inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/90" />

      <div className="relative flex min-h-svh items-start justify-center overflow-y-auto p-4 py-8">
        <div className="w-full max-w-sm rounded-3xl border border-white/12 bg-black/45 p-6 backdrop-blur-xl">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-white text-black shadow-lg shadow-black/40">
              <GestRunLogo className="size-7" />
            </div>
            <p className="text-[11px] font-bold tracking-[0.3em] text-white/60">GESTRUN</p>
            <h1 className="mt-1 text-2xl font-bold text-white">
              {modo === 'entrar' ? 'Bem-vindo de volta' : 'Cria a tua conta'}
            </h1>
            <p className="mt-1 text-sm text-white/60">Gere os teus ganhos e custos ao volante.</p>
          </div>

          <form onSubmit={avancar} className="space-y-3">
            {modo === 'entrar' ? (
              <Field
                icon={<User className="size-[18px]" />}
                placeholder="Email ou nome de utilizador"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                autoCapitalize="none"
              />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    icon={<User className="size-[18px]" />}
                    placeholder="Primeiro nome"
                    value={primeiroNome}
                    onChange={(e) => setPrimeiroNome(e.target.value)}
                    autoCapitalize="words"
                  />
                  <Field
                    icon={<User className="size-[18px]" />}
                    placeholder="Sobrenome"
                    value={sobrenome}
                    onChange={(e) => setSobrenome(e.target.value)}
                    autoCapitalize="words"
                  />
                </div>
                <Field
                  icon={<AtSign className="size-[18px]" />}
                  placeholder="Nome de utilizador"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoCapitalize="none"
                />
                <Field
                  icon={<Mail className="size-[18px]" />}
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoCapitalize="none"
                />
                <Field
                  icon={<Calendar className="size-[18px]" />}
                  type="date"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  style={{ colorScheme: 'dark' }}
                  aria-label="Data de nascimento"
                />
              </>
            )}

            <Field
              icon={<Lock className="size-[18px]" />}
              type={verPassword ? 'text' : 'password'}
              placeholder="Palavra-passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoCapitalize="none"
              right={eyeToggle}
            />

            {modo === 'criar' ? (
              <>
                <Field
                  icon={<Lock className="size-[18px]" />}
                  type={verPassword ? 'text' : 'password'}
                  placeholder="Confirmar palavra-passe"
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  autoCapitalize="none"
                />
                {confirmar.length > 0 && !senhasIguais ? (
                  <p className="px-1 text-xs text-red-400">As palavras-passe não coincidem.</p>
                ) : (
                  <p className="px-1 text-xs text-white/45">Palavra-passe com mínimo 6 caracteres.</p>
                )}
              </>
            ) : null}

            {modo === 'entrar' ? (
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-sm text-white/70">
                  <Switch checked={lembrar} onCheckedChange={setLembrar} />
                  Lembrar-me
                </label>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={!podeAvancar || loading}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-45"
            >
              {loading ? 'A carregar…' : modo === 'entrar' ? 'Entrar' : 'Criar conta'}
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
              disabled
              className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-3 text-sm font-medium text-white/40 transition-colors opacity-50 cursor-not-allowed"
            >
              <GoogleIcon className="size-4 opacity-50" /> Google <span className="text-[10px] opacity-75">(Em breve)</span>
            </button>
            <button
              type="button"
              disabled
              className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-3 text-sm font-medium text-white/40 transition-colors opacity-50 cursor-not-allowed"
            >
              <AppleIcon className="size-4 opacity-50" /> Apple <span className="text-[10px] opacity-75">(Em breve)</span>
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
