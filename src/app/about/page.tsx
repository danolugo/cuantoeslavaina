import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Acerca de
              </h1>
              <p className="text-sm text-muted-foreground">
                Información sobre las fuentes y disclaimers
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Fuentes de datos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Banco Central de Venezuela (BCV)</h3>
                <p className="text-sm text-muted-foreground">
                  Tasas oficiales para USD/VES y EUR/VES. Fuente primaria y más confiable para el Bolívar Soberano.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Frankfurter (ECB)</h3>
                <p className="text-sm text-muted-foreground">
                  Tasas del Banco Central Europeo para EUR/USD. Fuente oficial europea.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Servicios públicos de FX</h3>
                <p className="text-sm text-muted-foreground">
                  ExchangeRate.host y otros servicios para COP/USD y conversiones cruzadas.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Disclaimers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  • Las tasas de cambio se actualizan automáticamente pero pueden tener retrasos.
                </p>
                <p>
                  • Los valores mostrados son aproximados y pueden diferir de las tasas reales de transacción.
                </p>
                <p>
                  • Para transacciones importantes, consulte siempre con su banco o casa de cambio.
                </p>
                <p>
                  • No nos hacemos responsables por pérdidas derivadas del uso de esta información.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tecnología</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  Esta aplicación está construida con Next.js, TypeScript, Tailwind CSS y shadcn/ui.
                </p>
                <p>
                  Utiliza el Edge Runtime de Vercel para un rendimiento óptimo y compatibilidad con TweakCN themes.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
