import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import Modal from '../components/Modal';
import ErrorMessage from '../components/ErrorMessage';
import Footer from '../components/Footer';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
const GENEROS = [
  'Pop',
  'Reggae',
  'Pagode',
  'Sertanejo',
  'Rock',
  'Clássico',
  'Louvor',
  'Outro',
];
export default function PlaylistDetailPage() {
  const { id: playlistId } = useParams();
  const [playlist, setPlaylist] = useState(null);
  useDocumentTitle(
    playlist ? `BiblioMusic — ${playlist.nome}` : 'BiblioMusic — Playlist',
  );
  const [musicas, setMusicas] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const limite = 5;
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [musicaEditando, setMusicaEditando] = useState(null);
  const [musicaDetalhe, setMusicaDetalhe] = useState(null);
  const [form, setForm] = useState({
    titulo: '',
    artista: '',
    album: '',
    duracao_min: '',
    duracao_seg: '',
    genero: GENEROS[0],
    ano_lancamento: '',
  });
  useEffect(() => {
    carregarPlaylist();
  }, [playlistId]);
  useEffect(() => {
    carregarMusicas();
  }, [playlistId, pagina]);
  async function carregarPlaylist() {
    try {
      const { data } = await api.get(`/playlists/${playlistId}`);
      setPlaylist(data);
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao carregar a playlist.');
    }
  }
  async function carregarMusicas() {
    setCarregando(true);
    setErro('');
    try {
      const { data } = await api.get(`/playlists/${playlistId}/songs`, {
        params: {
          pagina,
          limite,
        },
      });
      setMusicas(data.musicas);
      setTotal(data.total);
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao carregar as músicas.');
    } finally {
      setCarregando(false);
    }
  }
  function abrirModalNova() {
    setMusicaEditando(null);
    setForm({
      titulo: '',
      artista: '',
      album: '',
      duracao_min: '',
      duracao_seg: '',
      genero: GENEROS[0],
      ano_lancamento: '',
    });
    setModalAberto(true);
  }
  function abrirModalEditar(musica) {
    setMusicaEditando(musica);
    setForm({
      titulo: musica.titulo,
      artista: musica.artista,
      album: musica.album || '',
      duracao_min: musica.duracao_segundos
        ? Math.floor(musica.duracao_segundos / 60)
        : '',
      duracao_seg: musica.duracao_segundos ? musica.duracao_segundos % 60 : '',
      genero: musica.genero || GENEROS[0],
      ano_lancamento: musica.ano_lancamento || '',
    });
    setModalAberto(true);
  }
  async function salvarMusica(e) {
    e.preventDefault();
    setErro('');
    const min = parseInt(form.duracao_min, 10) || 0;
    const seg = parseInt(form.duracao_seg, 10) || 0;
    const temDuracao = form.duracao_min !== '' || form.duracao_seg !== '';
    const payload = {
      ...form,
      duracao_segundos: temDuracao ? min * 60 + seg : null,
    };
    delete payload.duracao_min;
    delete payload.duracao_seg;
    try {
      if (musicaEditando) {
        await api.put(
          `/playlists/${playlistId}/songs/${musicaEditando.id}`,
          payload,
        );
      } else {
        await api.post(`/playlists/${playlistId}/songs`, payload);
      }
      setModalAberto(false);
      carregarMusicas();
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao salvar a música.');
    }
  }
  async function excluirMusica(id) {
    if (!window.confirm('Excluir esta música da playlist?')) return;
    try {
      await api.delete(`/playlists/${playlistId}/songs/${id}`);
      carregarMusicas();
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao excluir a música.');
    }
  }
  function formatarDuracao(segundos) {
    if (!segundos) return '--:--';
    const m = Math.floor(segundos / 60);
    const s = segundos % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }
  const totalPaginas = Math.max(1, Math.ceil(total / limite));
  return (
    <div className="min-h-svh flex flex-col bg-ios-bg">
      <header className="px-5 sm:px-8 py-5">
        <Link
          to="/biblioteca"
          className="text-sm text-ios-pink-600 font-medium"
        >
          ← Minha Biblioteca
        </Link>
        {playlist && (
          <div className="flex items-center gap-3 mt-3">
            {playlist.imagem_capa ? (
              <img
                src={playlist.imagem_capa}
                alt={`Capa da playlist ${playlist.nome}`}
                className="w-14 h-14 rounded-ios-sm object-cover shrink-0"
              />
            ) : (
              <div
                className="w-14 h-14 rounded-ios-sm flex items-center justify-center text-white text-xl shrink-0"
                style={{
                  backgroundColor: playlist.cor_capa || '#FF2D87',
                }}
              >
                🎧
              </div>
            )}
            <div>
              <h1 className="text-2xl font-semibold text-ios-text">
                {playlist.nome}
              </h1>
              <p className="text-sm text-ios-muted">
                {playlist.descricao || 'Sem descrição'}
              </p>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 px-5 sm:px-8">
        <ErrorMessage mensagem={erro} />

        <button
          onClick={abrirModalNova}
          className="mb-5 px-5 py-3 rounded-ios-sm bg-ios-pink-500 hover:bg-ios-pink-600 text-white text-sm font-medium transition"
        >
          + Adicionar música
        </button>

        {carregando ? (
          <p className="text-ios-muted text-sm">Carregando...</p>
        ) : musicas.length === 0 ? (
          <p className="text-ios-muted text-sm">
            Nenhuma música ainda. Adicione a primeira!
          </p>
        ) : (
          <div className="bg-white rounded-ios shadow-sm divide-y divide-ios-pink-50 overflow-hidden">
            {musicas.map((musica) => (
              <div
                key={musica.id}
                className="flex items-center justify-between px-5 py-4 hover:bg-ios-pink-50/40 transition"
              >
                <button
                  onClick={() => setMusicaDetalhe(musica)}
                  className="flex-1 text-left min-w-0"
                >
                  <p className="font-medium text-ios-text truncate">
                    {musica.titulo}
                  </p>
                  <p className="text-xs text-ios-muted truncate">
                    {musica.artista}
                  </p>
                </button>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <span className="text-xs text-ios-muted">
                    {formatarDuracao(musica.duracao_segundos)}
                  </span>
                  <button
                    onClick={() => abrirModalEditar(musica)}
                    className="text-xs text-ios-pink-600 font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => excluirMusica(musica.id)}
                    className="text-xs text-red-500 font-medium"
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

      {}
      <Modal
        aberto={modalAberto}
        titulo={musicaEditando ? 'Editar música' : 'Nova música'}
        onFechar={() => setModalAberto(false)}
      >
        <form onSubmit={salvarMusica} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Título"
            required
            value={form.titulo}
            onChange={(e) =>
              setForm({
                ...form,
                titulo: e.target.value,
              })
            }
            className="w-full px-4 py-3 rounded-ios-sm bg-ios-pink-50 text-sm focus:outline-none"
          />
          <input
            type="text"
            placeholder="Artista"
            required
            value={form.artista}
            onChange={(e) =>
              setForm({
                ...form,
                artista: e.target.value,
              })
            }
            className="w-full px-4 py-3 rounded-ios-sm bg-ios-pink-50 text-sm focus:outline-none"
          />
          <input
            type="text"
            placeholder="Álbum (opcional)"
            value={form.album}
            onChange={(e) =>
              setForm({
                ...form,
                album: e.target.value,
              })
            }
            className="w-full px-4 py-3 rounded-ios-sm bg-ios-pink-50 text-sm focus:outline-none"
          />
          <div>
            <p className="text-xs text-ios-muted mb-1 ml-1">Duração</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                placeholder="Min"
                value={form.duracao_min}
                onChange={(e) =>
                  setForm({
                    ...form,
                    duracao_min: e.target.value,
                  })
                }
                className="w-1/2 px-4 py-3 rounded-ios-sm bg-ios-pink-50 text-sm focus:outline-none"
              />
              <span className="text-ios-muted font-medium">:</span>
              <input
                type="number"
                min="0"
                max="59"
                placeholder="Seg"
                value={form.duracao_seg}
                onChange={(e) =>
                  setForm({
                    ...form,
                    duracao_seg: e.target.value,
                  })
                }
                className="w-1/2 px-4 py-3 rounded-ios-sm bg-ios-pink-50 text-sm focus:outline-none"
              />
            </div>
          </div>
          <input
            type="number"
            placeholder="Ano de lançamento"
            value={form.ano_lancamento}
            onChange={(e) =>
              setForm({
                ...form,
                ano_lancamento: e.target.value,
              })
            }
            className="w-full px-4 py-3 rounded-ios-sm bg-ios-pink-50 text-sm focus:outline-none"
          />
          <select
            value={form.genero}
            onChange={(e) =>
              setForm({
                ...form,
                genero: e.target.value,
              })
            }
            className="w-full px-4 py-3 rounded-ios-sm bg-ios-pink-50 text-sm focus:outline-none"
          >
            {GENEROS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="w-full mt-2 py-3 rounded-ios-sm bg-ios-pink-500 hover:bg-ios-pink-600 text-white font-medium text-sm transition"
          >
            Salvar
          </button>
        </form>
      </Modal>

      {}
      <Modal
        aberto={!!musicaDetalhe}
        titulo="Detalhes da música"
        onFechar={() => setMusicaDetalhe(null)}
      >
        {musicaDetalhe && (
          <div className="flex flex-col gap-2 text-sm">
            <DetalheLinha label="Título" valor={musicaDetalhe.titulo} />
            <DetalheLinha label="Artista" valor={musicaDetalhe.artista} />
            <DetalheLinha label="Álbum" valor={musicaDetalhe.album || '—'} />
            <DetalheLinha
              label="Duração"
              valor={formatarDuracao(musicaDetalhe.duracao_segundos)}
            />
            <DetalheLinha label="Gênero" valor={musicaDetalhe.genero || '—'} />
            <DetalheLinha
              label="Ano de lançamento"
              valor={musicaDetalhe.ano_lancamento || '—'}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
function DetalheLinha({ label, valor }) {
  return (
    <div className="flex justify-between border-b border-ios-pink-50 py-2">
      <span className="text-ios-muted">{label}</span>
      <span className="text-ios-text font-medium">{valor}</span>
    </div>
  );
}
