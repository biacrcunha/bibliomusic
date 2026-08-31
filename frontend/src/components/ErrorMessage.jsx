export default function ErrorMessage({ mensagem }) {
  if (!mensagem) return null;
  return (
    <div className="w-full rounded-ios-sm bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 mb-3">
      {mensagem}
    </div>
  );
}
