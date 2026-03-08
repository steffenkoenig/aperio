import Link from 'next/link';
import { SpecLoader } from '@/components/spec-loader';
import { Badge } from '@/components/ui/badge';
import { Database, Zap, Shield, Code2, ArrowRight, Layers } from 'lucide-react';

const features = [
  {
    icon: Database,
    title: 'Auto-Generated Tables',
    description: 'GET collection endpoints become sortable, filterable data tables automatically.',
  },
  {
    icon: Code2,
    title: 'Dynamic Forms',
    description: 'POST/PUT/PATCH operations render as smart forms with inline validation.',
  },
  {
    icon: Zap,
    title: 'Path Intelligence',
    description: 'Automatically classifies resources, sub-resources, and actions from your API paths.',
  },
  {
    icon: Shield,
    title: 'Multi-Environment',
    description: 'Switch between dev, staging, and production with per-environment auth configs.',
  },
  {
    icon: Layers,
    title: 'Sidebar Navigation',
    description: 'Hierarchical resource tree in the sidebar, built directly from your spec.',
  },
  {
    icon: ArrowRight,
    title: 'API Proxy',
    description: 'Built-in CORS proxy handles auth injection and request forwarding.',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">A</span>
            </div>
            <span className="font-semibold text-lg">Aperio</span>
            <Badge variant="secondary" className="text-[10px]">Beta</Badge>
          </div>
          <nav className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="https://github.com" className="hover:text-foreground transition-colors">GitHub</Link>
            <Link href="/dashboard" className="hover:text-foreground transition-colors font-medium text-foreground">Dashboard →</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="max-w-6xl mx-auto px-4 pt-24 pb-20 text-center">
          <Badge variant="outline" className="mb-6 text-xs">
            OpenAPI → Admin UI, instantly
          </Badge>
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            Your API Spec is your<br />Admin Dashboard
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
            Aperio reads any OpenAPI 3.x specification and generates a fully functional, 
            interactive admin UI — no code required.
          </p>

          {/* Loader */}
          <div className="flex flex-col items-center gap-8">
            <SpecLoader />
          </div>
        </section>

        {/* Features */}
        <section className="bg-muted/30 border-y">
          <div className="max-w-6xl mx-auto px-4 py-20">
            <h2 className="text-2xl font-bold text-center mb-3">Everything you need</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
              Aperio understands your API structure and generates the right UI for each endpoint type.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((feature) => (
                <div key={feature.title} className="bg-background rounded-xl p-5 border hover:border-primary/30 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="max-w-6xl mx-auto px-4 py-20">
          <h2 className="text-2xl font-bold text-center mb-12">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Load your spec', desc: 'Paste a URL or upload a JSON/YAML OpenAPI spec file.' },
              { step: '02', title: 'Configure environments', desc: 'Set base URLs and auth tokens for each environment.' },
              { step: '03', title: 'Explore & operate', desc: 'Browse resources, fetch data, submit forms — all from the dashboard.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="text-4xl font-bold text-primary/20 mb-3">{item.step}</div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t py-8 text-center text-xs text-muted-foreground">
        <p>Aperio — OpenAPI spec to admin UI engine</p>
      </footer>
    </div>
  );
}
