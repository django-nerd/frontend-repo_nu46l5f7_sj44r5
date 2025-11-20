export default function CTA({ t }) {
  return (
    <section className="py-16 bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="rounded-2xl bg-white/10 backdrop-blur p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">{t('cta_title')}</h2>
            <p className="text-white/80">{t('cta_sub')}</p>
          </div>
          <div className="flex gap-3">
            <a href="/dashboard" className="px-4 py-2 rounded-lg bg-white text-slate-900 font-semibold hover:opacity-90 transition">{t('cta_get_started')}</a>
            <a href="/test" className="px-4 py-2 rounded-lg bg-black/30 text-white font-semibold hover:bg-black/40 transition">{t('cta_test_backend')}</a>
          </div>
        </div>
      </div>
    </section>
  )
}
