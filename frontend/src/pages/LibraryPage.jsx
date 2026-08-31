import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import ErrorMessage from '../components/ErrorMessage';
import Footer from '../components/Footer';
import { lerImagemComoBase64Redimensionada } from '../utils/imagem';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
const CORES = [
  '#FFD1DC',
  '#FFDAB9',
  '#FFF5BA',
  '#C1E1C1',
  '#B5EAD7',
  '#AEC6E8',
  '#D7C4F2',
  '#FFB7B2',
];
export default function LibraryPage() {
  useDocumentTitle('BiblioMusic — Minha Biblioteca');
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const limite = 6;
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [playlistEditando, setPlaylistEditando] = useState(null);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [cor, setCor] = useState(CORES[0]);
  const [imagem, setImagem] = useState(null);
  const inputArquivoRef = useRef(null);
  useEffect(() => {
    carregarPlaylists();
  }, [pagina]);
  async function carregarPlaylists() {
    setCarregando(true);
    setErro('');
    try {
      const { data } = await api.get('/playlists', {
        params: {
          pagina,
          limite,
        },
      });
      setPlaylists(data.playlists);
      setTotal(data.total);
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao carregar suas playlists.');
    } finally {
      setCarregando(false);
    }
  }
  function abrirModalNova() {
    setPlaylistEditando(null);
    setNome('');
    setDescricao('');
    setCor(CORES[0]);
    setImagem(null);
    setModalAberto(true);
  }
  function abrirModalEditar(playlist) {
    setPlaylistEditando(playlist);
    setNome(playlist.nome);
    setDescricao(playlist.descricao || '');
    setCor(playlist.cor_capa || CORES[0]);
    setImagem(playlist.imagem_capa || null);
    setModalAberto(true);
  }
  async function handleEscolherFoto(e) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    setErro('');
    try {
      const base64 = await lerImagemComoBase64Redimensionada(arquivo, 400, 0.8);
      setImagem(base64);
    } catch (err) {
      setErro('Não foi possível usar essa imagem. Tente outra foto.');
    } finally {
      e.target.value = '';
    }
  }
  async function salvarPlaylist(e) {
    e.preventDefault();
    setErro('');
    const payload = {
      nome,
      descricao,
      cor_capa: cor,
      imagem_capa: imagem,
    };
    try {
      if (playlistEditando) {
        await api.put(`/playlists/${playlistEditando.id}`, payload);
      } else {
        await api.post('/playlists', payload);
      }
      setModalAberto(false);
      carregarPlaylists();
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao salvar a playlist.');
    }
  }
  async function excluirPlaylist(id) {
    if (
      !window.confirm(
        'Tem certeza que quer excluir esta playlist e todas as músicas dela?',
      )
    )
      return;
    try {
      await api.delete(`/playlists/${id}`);
      carregarPlaylists();
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao excluir a playlist.');
    }
  }
  const totalPaginas = Math.max(1, Math.ceil(total / limite));
  return (
    <div className="min-h-svh flex flex-col bg-ios-bg">
      <header className="flex items-center justify-between px-5 sm:px-8 py-5">
        <div>
          <h1 className="text-2xl font-semibold text-ios-text">
            Minha Biblioteca
          </h1>
          <p className="text-sm text-ios-muted">
            Olá, {usuario?.nome?.split(' ')[0]}
          </p>
        </div>
        <button
          onClick={() => {
            logout();
            navigate('/', {
              replace: true,
            });
          }}
          className="text-sm text-ios-pink-600 font-medium"
        >
          Sair
        </button>
      </header>

      <main className="flex-1 px-5 sm:px-8">
        <ErrorMessage mensagem={erro} />

        <button
          onClick={abrirModalNova}
          className="mb-5 px-5 py-3 rounded-ios-sm bg-ios-pink-500 hover:bg-ios-pink-600 text-white text-sm font-medium transition"
        >
          + Nova playlist
        </button>

        {carregando ? (
          <p className="text-ios-muted text-sm">Carregando...</p>
        ) : playlists.length === 0 ? (
          <p className="text-ios-muted text-sm">
            Você ainda não tem playlists. Crie a primeira!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                className="bg-white rounded-ios shadow-sm p-5 flex flex-col gap-3"
              >
                <Link
                  to={`/playlists/${playlist.id}`}
                  className="flex items-center gap-3"
                >
                  {playlist.imagem_capa ? (
                    <img
                      src={playlist.imagem_capa}
                      alt={`Capa da playlist ${playlist.nome}`}
                      className="w-12 h-12 rounded-ios-sm object-cover shrink-0"
                    />
                  ) : (
                    <div
                      className="w-12 h-12 rounded-ios-sm flex items-center justify-center text-white text-lg shrink-0"
                      style={{
                        backgroundColor: playlist.cor_capa || '#FF2D87',
                      }}
                    >
                      🎧
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-ios-text truncate">
                      {playlist.nome}
                    </p>
                    <p className="text-xs text-ios-muted truncate">
                      {playlist.descricao || 'Sem descrição'}
                    </p>
                  </div>
                </Link>
                <div className="flex gap-2 text-xs mt-1">
                  <button
                    onClick={() => abrirModalEditar(playlist)}
                    className="text-ios-pink-600 font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => excluirPlaylist(playlist.id)}
                    className="text-red-500 font-medium"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPaginas > 1 && (
          <div className="flex items-center justify-center gap-4 mt-6 pb-4">
            <button
              disabled={pagina <= 1}
              onClick={() => setPagina((p) => p - 1)}
              className="px-4 py-2 rounded-ios-sm bg-white text-sm disabled:opacity-40"
            >
              ← Anterior
            </button>
            <span className="text-sm text-ios-muted">
              Página {pagina} de {totalPaginas}
            </span>
            <button
              disabled={pagina >= totalPaginas}
              onClick={() => setPagina((p) => p + 1)}
              className="px-4 py-2 rounded-ios-sm bg-white text-sm disabled:opacity-40"
            >
              Próxima →
            </button>
          </div>
        )}
      </main>

      <Footer />

      <Modal
        aberto={modalAberto}
        titulo={playlistEditando ? 'Editar playlist' : 'Nova playlist'}
        onFechar={() => setModalAberto(false)}
      >
        <form onSubmit={salvarPlaylist} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Nome da playlist"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-ios-sm bg-ios-pink-50 text-sm focus:outline-none"
          />
          <input
            type="text"
            placeholder="Descrição (opcional)"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="w-full px-4 py-3 rounded-ios-sm bg-ios-pink-50 text-sm focus:outline-none"
          />

          <p className="text-xs text-ios-muted -mb-1">Capa da playlist</p>

          <div className="flex items-center gap-3">
            {}
            <button
              type="button"
              onClick={() => inputArquivoRef.current?.click()}
              className="w-16 h-16 rounded-ios-sm overflow-hidden flex items-center justify-center shrink-0 border border-dashed border-ios-pink-300"
              style={{
                backgroundColor: imagem ? 'transparent' : cor,
              }}
              aria-label="Escolher foto de capa"
            >
              {imagem ? (
                <img
                  src={imagem}
                  alt="Prévia da capa"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xl">📷</span>
              )}
            </button>

            <input
              ref={inputArquivoRef}
              type="file"
              accept="image/*"
              onChange={handleEscolherFoto}
              className="hidden"
            />

            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => inputArquivoRef.current?.click()}
                className="text-xs text-ios-pink-600 font-medium text-left"
              >
                {imagem ? 'Trocar foto' : 'Escolher foto'}
              </button>
              {imagem && (
                <button
                  type="button"
                  onClick={() => setImagem(null)}
                  className="text-xs text-red-500 font-medium text-left"
                >
                  Remover foto (usar cor)
                </button>
              )}
            </div>
          </div>

          {!imagem && (
            <div className="flex gap-2">
              {CORES.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setCor(c)}
                  className={`w-8 h-8 rounded-full border-2 ${cor === c ? 'border-ios-text' : 'border-transparent'}`}
                  style={{
                    backgroundColor: c,
                  }}
                  aria-label={`Cor ${c}`}
                />
              ))}
            </div>
          )}

          <button
            type="submit"
            className="w-full mt-2 py-3 rounded-ios-sm bg-ios-pink-500 hover:bg-ios-pink-600 text-white font-medium text-sm transition"
          >
            Salvar
          </button>
        </form>
      </Modal>
    </div>
  );
}
