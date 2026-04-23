import { Link } from 'react-router-dom'

const DRUG_CATEGORIES = [
  'Antibiotics', 'Antimalarials', 'Painkillers', 'Hypertension', 'Diabetes',
  'Vitamins', 'Asthma', 'ARVs', 'Eye drops', 'Children meds',
  'Hormones', 'Antifungals', 'Skincare', 'Fertility', 'Mental health',
]

const PATIENT_STEPS = [
  { icon: '💬', title: 'Open WhatsApp', body: 'Message MedsNear on WhatsApp — no app download needed.' },
  { icon: '💊', title: 'Type medication', body: 'Send the name of the drug you\'re looking for.' },
  { icon: '📍', title: 'Share location', body: 'Share your location once so we can find nearby pharmacies.' },
  { icon: '🏥', title: 'See results', body: 'Get a list of pharmacies with stock, price, and distance.' },
  { icon: '🛒', title: 'Place order', body: 'Reply with your choice to confirm the order.' },
  { icon: '💳', title: 'Pay & receive', body: 'Pay via bank transfer. Delivery arrives in 2–4 hours.' },
]

const CUSTOMER_FAQS = [
  { q: 'Is it free to use?', a: 'Yes. Searching for drugs on MedsNear is completely free.' },
  { q: 'How long does delivery take?', a: 'Typically 2–4 hours within Lagos.' },
  { q: 'What if a drug is out of stock?', a: 'We\'ll show you the next nearest pharmacy with stock.' },
  { q: 'Is payment secure?', a: 'Yes. All payments go to the verified MedsNear company account.' },
  { q: 'Can I order for someone else?', a: 'Yes. Just provide the delivery address during checkout.' },
  { q: 'What if I need a refund?', a: 'Contact us on WhatsApp and we\'ll arrange a replacement or refund.' },
]

function FAQ({ q, a }) {
  return (
    <div className="border border-outline/40 rounded-xl p-5">
      <p className="font-semibold text-sm text-on-surface mb-1">{q}</p>
      <p className="text-sm text-on-surface-variant leading-relaxed">{a}</p>
    </div>
  )
}

export default function HowItWorks() {
  return (
    <div>
      {/* HERO */}
      <section className="bg-gradient-to-br from-[#f0f5ff] via-white to-surface pt-16 pb-20 md:pt-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-on-surface tracking-tight mb-5">How MedsNear works</h1>
          <p className="text-base md:text-lg text-on-surface-variant mb-8">From search to delivery — here's everything.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="https://wa.me/2348157537642" target="_blank" rel="noreferrer" className="btn-primary text-sm py-3.5 px-7">For patients</a>
            <Link to="/agents" className="btn-outline text-sm py-3.5 px-7">For agents</Link>
          </div>
        </div>
      </section>

      {/* PATIENT JOURNEY */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-primary font-label">Patient journey</span>
            <h2 className="text-3xl font-black text-on-surface tracking-tight mt-3">From search to delivery in minutes</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {PATIENT_STEPS.map((s, i) => (
              <div key={s.title} className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl mx-auto mb-3">{s.icon}</div>
                <p className="text-[10px] font-bold text-primary font-label uppercase tracking-wider mb-1">Step {i + 1}</p>
                <p className="font-semibold text-sm text-on-surface mb-1">{s.title}</p>
                <p className="text-xs text-on-surface-variant leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <a href="https://wa.me/2348157537642" target="_blank" rel="noreferrer" className="btn-primary text-sm">Start your search now →</a>
          </div>
        </div>
      </section>

      {/* DRUG COVERAGE */}
      <section className="py-20 bg-surface-low">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-primary font-label">Drug coverage</span>
            <h2 className="text-3xl font-black text-on-surface tracking-tight mt-3">We cover all major drug categories</h2>
          </div>
          <div className="flex flex-wrap gap-2.5 justify-center">
            {DRUG_CATEGORIES.map((cat) => (
              <span key={cat} className="px-4 py-2 bg-white border border-outline/40 rounded-full text-sm font-medium text-on-surface hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-default">
                {cat}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* BEHIND THE SCENES */}
      <section className="py-20 bg-[#0d1b2e] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-primary font-label">Behind the scenes</span>
            <h2 className="text-3xl font-black mt-3 tracking-tight">How the data stays fresh</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '🚶', title: 'Agents visit pharmacies', body: 'Field agents physically visit pharmacies and log real inventory data.' },
              { icon: '⚡', title: 'Data goes live instantly', body: 'Every upload is immediately searchable by customers on WhatsApp.' },
              { icon: '🔄', title: 'Regular updates', body: 'Agents revisit pharmacies regularly to keep stock levels accurate.' },
            ].map((c) => (
              <div key={c.title} className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="text-3xl mb-4">{c.icon}</div>
                <p className="font-bold text-white mb-2">{c.title}</p>
                <p className="text-sm text-white/60 leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-black text-on-surface tracking-tight mb-8 text-center">Customer FAQs</h2>
          <div className="space-y-3">
            {CUSTOMER_FAQS.map((f) => <FAQ key={f.q} {...f} />)}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 bg-surface-low">
        <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-black text-on-surface tracking-tight mb-4">Ready to find your medication?</h2>
          <a href="https://wa.me/2348157537642" target="_blank" rel="noreferrer" className="btn-primary text-sm py-3.5 px-8">
            Search on WhatsApp →
          </a>
          <p className="text-xs text-on-surface-variant mt-4 font-label">Available daily, 7am – 10pm</p>
        </div>
      </section>
    </div>
  )
}
