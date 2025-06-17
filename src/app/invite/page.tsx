// src/app/invite/page.tsx

export default function InvitePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold text-center mb-2">Una invitación más</h2>

          <p className="text-gray-600 text-center mb-6">
            Ingresa tu código para comenzar
          </p>

          <input
            type="text"
            placeholder="Código de invitación"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <button className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors">
            Continuar
          </button>

          <p className="text-sm text-gray-500 text-center mt-6">
            Si conoces a alguien usando RanchOS, pídele que te invite.
          </p>
        </div>
      </div>
    </div>
  );
}