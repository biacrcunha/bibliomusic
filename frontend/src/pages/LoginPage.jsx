import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from '../components/ErrorMessage';
import Footer from '../components/Footer';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
export default function LoginPage() {
  const [modo, setModo] = useState('entrar');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const { usuario, login, registrar } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (usuario) {
      navigate('/biblioteca', {
        replace: true,
      });
    }
  }, [usuario, navigate]);
  useDocumentTitle(
    modo === 'entrar' ? 'BiblioMusic — Entrar' : 'BiblioMusic — Cadastrar',
  );
  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      if (modo === 'entrar') {
        await login(email, senha);
      } else {
        await registrar(nome, email, senha);
      }
      navigate('/biblioteca');
    } catch (err) {
      const status = err.response?.status;
      // Sem resposta (API dormindo) ou erro 5xx (banco desligado):
      // o problema é no servidor, não nos dados digitados.
      const servidorIndisponivel = !status || status >= 500;
      const mensagem = servidorIndisponivel
        ? 'O servidor está iniciando. Aguarde cerca de 1 minuto e tente novamente.'
        : err.response.data?.erro || 'Não foi possível concluir. Tente novamente.';
      setErro(mensagem);
    } finally {
      setCarregando(false);
    }
  }
  return (
    <div className="min-h-svh flex flex-col bg-ios-bg">
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-3 rounded-ios-sm bg-ios-pink-500 flex items-center justify-center text-white text-2xl">
              🎵
            </div>
            <h1 className="text-2xl font-semibold text-ios-text">
              BiblioMusic
            </h1>
            <p className="text-ios-muted text-sm mt-1">
              Sua biblioteca de músicas
            </p>
          </div>

          <div className="bg-white rounded-ios shadow-sm p-6">
            <div className="flex bg-ios-pink-50 rounded-ios-sm p-1 mb-5">
              <button
                type="button"
                onClick={() => {
                  setModo('entrar');
                  setErro('');
                }}
                className={`flex-1 py-2 rounded-ios-sm text-sm font-medium transition ${modo === 'entrar' ? 'bg-white text-ios-pink-600 shadow-sm' : 'text-ios-muted'}`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => {
                  setModo('cadastrar');
                  setErro('');
                }}
                className={`flex-1 py-2 rounded-ios-sm text-sm font-medium transition ${modo === 'cadastrar' ? 'bg-white text-ios-pink-600 shadow-sm' : 'text-ios-muted'}`}
              >
                Cadastrar
              </button>
            </div>

            <ErrorMessage mensagem={erro} />

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {modo === 'cadastrar' && (
                <input
                  type="text"
                  placeholder="Nome completo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-ios-sm bg-ios-pink-50 border border-transparent focus:border-ios-pink-300 focus:outline-none text-sm"
                />
              )}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-ios-sm bg-ios-pink-50 border border-transparent focus:border-ios-pink-300 focus:outline-none text-sm"
              />
              <input
                type="password"
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                {...(modo === 'cadastrar'
                  ? {
                      minLength: 6,
                    }
                  : {})}
                className="w-full px-4 py-3 rounded-ios-sm bg-ios-pink-50 border border-transparent focus:border-ios-pink-300 focus:outline-none text-sm"
              />
              {modo === 'cadastrar' && (
                <p className="text-xs text-ios-muted -mt-1 ml-1">
                  A senha deve ter pelo menos 6 caracteres.
                </p>
              )}

              <button
                type="submit"
                disabled={carregando}
                className="w-full mt-2 py-3 rounded-ios-sm bg-ios-pink-500 hover:bg-ios-pink-600 text-white font-medium text-sm transition disabled:opacity-60"
              >
                {carregando
                  ? 'Aguarde...'
                  : modo === 'entrar'
                    ? 'Entrar'
                    : 'Criar conta'}
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
