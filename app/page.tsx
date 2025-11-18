import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl text-center space-y-8">
        <h1 className="text-5xl font-bold text-gray-900">
          Assistente Financeiro Braúna
        </h1>
        <p className="text-xl text-gray-600">
          Controle seus gastos pessoais direto do WhatsApp
        </p>

        <div className="space-y-4 pt-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Como funciona
            </h2>
            <ul className="text-left space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="mr-2">💬</span>
                <span>Envie mensagens de gastos pelo WhatsApp</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🤖</span>
                <span>IA categoriza automaticamente seus gastos</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">📊</span>
                <span>Visualize relatórios e gráficos no dashboard</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">💰</span>
                <span>Consulte gastos por período diretamente no WhatsApp</span>
              </li>
            </ul>
          </div>

          <Link
            href="/dashboard"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Acessar Dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}
