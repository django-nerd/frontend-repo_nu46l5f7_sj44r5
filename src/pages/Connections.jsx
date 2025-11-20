import { useAuth } from '../auth/AuthContext'

export default function Connections(){
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Connections</h1>
        <div className="bg-white border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">Twitch</div>
              <div className="text-sm text-slate-600">{user?.twitch_user_id ? `Linked as ${user.twitch_user_id}` : 'Not linked yet'}</div>
            </div>
            <button className="px-4 py-2 rounded-lg border">{user?.twitch_user_id ? 'Re-link' : 'Link'}</button>
          </div>
          <p className="text-xs text-slate-500 mt-3">OAuth flow to be added soon.</p>
        </div>
      </div>
    </div>
  )
}
