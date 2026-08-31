export default function Modal({ aberto, titulo, onFechar, children }) {
  if (!aberto) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full sm:max-w-md bg-white rounded-t-ios sm:rounded-ios shadow-xl p-6 animate-[fadeIn_0.15s_ease-out]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-ios-text">{titulo}</h2>
          <button
            onClick={onFechar}
            className="w-8 h-8 rounded-full bg-ios-pink-50 text-ios-pink-600 flex items-center justify-center text-sm font-bold"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
