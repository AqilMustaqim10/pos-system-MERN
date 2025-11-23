import { Toaster } from "react-hot-toast";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100">
      <Toaster position="top-right" />

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center">
          {/* Header */}
          <h1 className="text-5xl font-bold text-primary-600 mb-4">
            🏪 POS Inventory System
          </h1>

          <p className="text-xl text-gray-600 mb-8">
            Modern Point of Sale & Inventory Management
          </p>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-lg shadow-soft p-6">
              <div className="text-success-500 text-3xl mb-2">✅</div>
              <h3 className="font-semibold text-gray-900 mb-1">Backend</h3>
              <p className="text-sm text-gray-500">API Ready</p>
            </div>

            <div className="bg-white rounded-lg shadow-soft p-6">
              <div className="text-primary-500 text-3xl mb-2">⚛️</div>
              <h3 className="font-semibold text-gray-900 mb-1">React + Vite</h3>
              <p className="text-sm text-gray-500">Fast Refresh</p>
            </div>

            <div className="bg-white rounded-lg shadow-soft p-6">
              <div className="text-warning-500 text-3xl mb-2">🎨</div>
              <h3 className="font-semibold text-gray-900 mb-1">TailwindCSS</h3>
              <p className="text-sm text-gray-500">Styled</p>
            </div>
          </div>

          {/* Info */}
          <div className="bg-white rounded-lg shadow-soft p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Setup Complete! 🎉
            </h2>
            <p className="text-gray-600 mb-6">
              Frontend is configured and ready for development.
            </p>
            <div className="flex gap-4 justify-center">
              <div className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg font-medium">
                React 19
              </div>
              <div className="px-4 py-2 bg-secondary-100 text-secondary-700 rounded-lg font-medium">
                Vite 7
              </div>
              <div className="px-4 py-2 bg-success-100 text-success-700 rounded-lg font-medium">
                Tailwind 4
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
