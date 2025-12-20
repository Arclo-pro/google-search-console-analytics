import { Card } from "@/components/ui/card";
import { Code } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-6">
            <Code className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Doctor Google Connector
          </h1>
          <p className="text-lg text-gray-600">
            Multi-tenant OAuth connector for Google Search Console & GA4 Data API
          </p>
        </div>

        <Card className="p-8 mb-8 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Setup Instructions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2 text-gray-800">1. Configure Replit Secrets</h3>
              <p className="text-gray-600 mb-3">
                Add the following secrets in your Replit project (Secrets tab):
              </p>
              <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-100 space-y-1">
                <div><span className="text-blue-400">GOOGLE_CLIENT_ID</span>=your_client_id</div>
                <div><span className="text-blue-400">GOOGLE_CLIENT_SECRET</span>=your_client_secret</div>
                <div><span className="text-blue-400">GOOGLE_REDIRECT_URI</span>=https://your-repl.repl.co/auth/callback</div>
                <div><span className="text-blue-400">JWT_SHARED_SECRET</span>=your_secure_random_string</div>
                <div className="text-gray-500">// Optional:</div>
                <div><span className="text-blue-400">AI_DOCTOR_BASE_URL</span>=https://ai-doctor-ui.com</div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2 text-gray-800">2. Google Cloud Console Setup</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Create a project in Google Cloud Console</li>
                <li>Enable Search Console API and Google Analytics Data API</li>
                <li>Create OAuth 2.0 credentials (Web application)</li>
                <li>Add authorized redirect URI: <code className="bg-gray-100 px-2 py-1 rounded text-sm">/auth/callback</code></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2 text-gray-800">3. OAuth Scopes</h3>
              <p className="text-gray-600 mb-2">This service requests the following scopes:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
                <li><code>webmasters.readonly</code> - Search Console data</li>
                <li><code>analytics.readonly</code> - Google Analytics data</li>
                <li><code>openid</code> & <code>email</code> - User identification</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="p-8 mb-8 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">API Endpoints</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2 text-gray-800">OAuth Flow</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm font-mono">
                <div><span className="text-green-600">GET</span> /auth/start?website_id=<span className="text-purple-600">{"{id}"}</span></div>
                <div><span className="text-green-600">GET</span> /auth/callback</div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2 text-gray-800">Protected API (requires Authorization header)</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm font-mono">
                <div><span className="text-green-600">GET</span> /api/websites/<span className="text-purple-600">:websiteId</span>/status</div>
                <div><span className="text-blue-600">POST</span> /api/websites/<span className="text-purple-600">:websiteId</span>/search-console/property</div>
                <div><span className="text-blue-600">POST</span> /api/websites/<span className="text-purple-600">:websiteId</span>/ga4/property</div>
                <div><span className="text-green-600">GET</span> /api/websites/<span className="text-purple-600">:websiteId</span>/search-console/summary</div>
                <div><span className="text-green-600">GET</span> /api/websites/<span className="text-purple-600">:websiteId</span>/search-console/top</div>
                <div><span className="text-green-600">GET</span> /api/websites/<span className="text-purple-600">:websiteId</span>/ga4/summary</div>
                <div><span className="text-green-600">GET</span> /api/websites/<span className="text-purple-600">:websiteId</span>/ga4/top-landing-pages</div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> All /api routes require an <code className="bg-yellow-100 px-2 py-1 rounded">Authorization: Bearer &lt;JWT&gt;</code> header
                signed with the JWT_SHARED_SECRET (HS256).
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-8 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Error Codes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 rounded p-3">
              <code className="text-red-600 font-semibold">NOT_CONNECTED</code>
              <p className="text-gray-600 mt-1">No Google connection found</p>
            </div>
            <div className="bg-gray-50 rounded p-3">
              <code className="text-red-600 font-semibold">INSUFFICIENT_SCOPE</code>
              <p className="text-gray-600 mt-1">Missing required permissions</p>
            </div>
            <div className="bg-gray-50 rounded p-3">
              <code className="text-red-600 font-semibold">RATE_LIMITED</code>
              <p className="text-gray-600 mt-1">Google API rate limit exceeded</p>
            </div>
            <div className="bg-gray-50 rounded p-3">
              <code className="text-red-600 font-semibold">INVALID_PROPERTY</code>
              <p className="text-gray-600 mt-1">Invalid or inaccessible property</p>
            </div>
          </div>
        </Card>

        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>Built for AI Doctor • Multi-tenant Google data connector</p>
        </div>
      </div>
    </div>
  );
}
