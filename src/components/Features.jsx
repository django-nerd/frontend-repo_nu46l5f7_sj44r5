import { Rocket, Puzzle, Layout, Sparkles, Lock, Globe, Zap } from 'lucide-react'

const features = [
  { icon: Layout, titleKey: 'feature_editor', descKey: 'feature_editor_desc' },
  { icon: Globe, titleKey: 'feature_overlay_url', descKey: 'feature_overlay_url_desc' },
  { icon: Sparkles, titleKey: 'feature_skins', descKey: 'feature_skins_desc' },
  { icon: Puzzle, titleKey: 'feature_widgets', descKey: 'feature_widgets_desc' },
  { icon: Lock, titleKey: 'feature_roles', descKey: 'feature_roles_desc' },
  { icon: Zap, titleKey: 'feature_realtime', descKey: 'feature_realtime_desc' },
]

export default function Features({ t }) {
  return (
    <section className="py-16 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-slate-900 dark:text-white">{t('section_features')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="border border-slate-200 dark:border-white/10 rounded-xl p-5 hover:shadow-lg transition bg-white/60 dark:bg-slate-900/60">
              <f.icon className="w-6 h-6 text-indigo-600 mb-3" />
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{t(f.titleKey)}</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">{t(f.descKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
