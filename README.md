# ¿Cuánto es la vaina? - Conversor de Monedas

Una aplicación web **mobile-first** para convertir entre Bolívares Soberanos, Dólares, Euros y Pesos Colombianos usando tasas de cambio en tiempo real.

## 🚀 Características

- **Mobile-first**: Diseño optimizado para dispositivos móviles
- **Tasas en tiempo real**: Integración con BCV, Frankfurter y servicios públicos de FX
- **Temas compatibles con TweakCN**: Soporte completo para temas externos
- **Edge Runtime**: Optimizado para Vercel con Edge Runtime
- **TypeScript**: Completamente tipado
- **Accesibilidad**: Cumple estándares de accesibilidad web

## 🛠️ Tecnologías

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS + shadcn/ui
- **Temas**: Compatible con TweakCN
- **Deploy**: Vercel (Edge Runtime)
- **Testing**: Vitest

## 📦 Instalación

### Prerrequisitos

- Node.js 18+ 
- pnpm (recomendado) o npm

### Configuración local

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd cuantoeslavaina
   ```

2. **Instalar dependencias**
   ```bash
   pnpm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp env.example .env.local
   ```
   
   Editar `.env.local`:
   ```env
   # Opcional: API key para servicios públicos de FX
   PUBLIC_FX_API_KEY=tu_api_key_aqui
   
   # Opcional: Endpoint personalizado de BCV
   BCV_ENDPOINT=https://www.bcv.org.ve/api/exchange
   ```

4. **Ejecutar en desarrollo**
   ```bash
   pnpm dev
   ```

5. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 🎨 Configuración de shadcn/ui

La aplicación ya incluye los componentes necesarios de shadcn/ui:

- Button
- Card
- Input
- Select
- Tooltip
- Skeleton

### Agregar nuevos componentes

Si necesitas agregar más componentes de shadcn/ui:

```bash
npx shadcn-ui@latest add [component-name]
```

## 🌐 APIs de Tasa de Cambio

### Fuentes principales

1. **BCV (Banco Central de Venezuela)**
   - USD/VES y EUR/VES
   - Fuente oficial venezolana
   - Fallback a parsing HTML si API no disponible

2. **Frankfurter (ECB)**
   - EUR/USD
   - Banco Central Europeo
   - Sin API key requerida

3. **Servicios públicos de FX**
   - COP/USD y conversiones cruzadas
   - ExchangeRate.host (sin API key)
   - OpenExchangeRates (con API key opcional)

### Configurar API keys

Para mejor cobertura de datos, puedes obtener API keys gratuitas:

1. **OpenExchangeRates**: https://openexchangerates.org/
2. **CurrencyAPI**: https://currencyapi.com/
3. **ExchangeRate-API**: https://exchangerate-api.com/

## 🎭 Sistema de Temas

### Temas incluidos

- **Light**: Tema claro por defecto
- **Dark**: Tema oscuro
- **TweakCN Modern**: Tema moderno compatible con TweakCN

### Uso de temas

1. **Cambiar tema**: Botón en el header
2. **URL parameter**: `?theme=dark`
3. **Persistencia**: Se guarda en localStorage

### Compatibilidad con TweakCN

La aplicación es compatible con temas de TweakCN:

```html
<html data-theme="tweakcn-modern">
  <!-- La app detectará y aplicará el tema -->
</html>
```

### Agregar nuevos temas

1. Editar `src/app/globals.css`
2. Agregar variables CSS para el nuevo tema
3. Actualizar `src/components/theme-switcher.tsx`

## 🧪 Testing

### Ejecutar tests

```bash
# Tests unitarios
pnpm test

# Tests con UI
pnpm test:ui

# Tests en modo watch
pnpm test --watch
```

### Cobertura de tests

Los tests cubren:
- Funciones de conversión
- Formateo de monedas
- Utilidades matemáticas
- Lógica de composición de tasas

## 🚀 Deploy en Vercel

### Deploy automático

1. **Conectar repositorio a Vercel**
   ```bash
   npx vercel
   ```

2. **Configurar variables de entorno en Vercel**
   - `PUBLIC_FX_API_KEY` (opcional)
   - `BCV_ENDPOINT` (opcional)

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Configuración manual

1. Crear proyecto en Vercel
2. Conectar repositorio GitHub
3. Configurar variables de entorno
4. Deploy automático en cada push

### Optimizaciones de Vercel

- **Edge Runtime**: APIs usan Edge Runtime
- **Caching**: Revalidación cada hora
- **ISR**: Incremental Static Regeneration
- **CDN**: Distribución global

## 📱 Características Mobile

### Responsive Design

- **Mobile-first**: Diseño optimizado para móviles
- **Touch-friendly**: Botones y inputs grandes
- **Gestos**: Swipe y touch optimizados
- **Performance**: Carga rápida en móviles

### PWA (Bonus)

Para habilitar PWA:

1. Agregar `manifest.json`
2. Configurar service worker
3. Habilitar offline caching

## 🔧 Configuración Avanzada

### Agregar nuevas monedas

1. **Actualizar tipos** en `src/lib/rates/types.ts`:
   ```typescript
   export type Currency = 'VES' | 'USD' | 'EUR' | 'COP' | 'BRL'
   ```

2. **Agregar información** en `CURRENCY_INFO`:
   ```typescript
   BRL: { name: 'Real Brasileño', symbol: 'R$', flag: '🇧🇷' }
   ```

3. **Implementar provider** para la nueva moneda

4. **Actualizar componentes** UI

### Personalizar providers

Para agregar nuevos providers:

1. Crear archivo en `src/lib/rates/providers/`
2. Implementar función que retorne `ProviderResult`
3. Agregar a `src/lib/rates/compose.ts`

### Configurar caching

```typescript
// En API routes
export const revalidate = 3600 // 1 hora

// Para forzar refresh
fetch('/api/rates?refresh=true')
```

## 🐛 Troubleshooting

### Problemas comunes

1. **BCV no responde**
   - La app usa fallbacks automáticamente
   - Se muestra banner de "fuentes alternativas"

2. **Tasas no se actualizan**
   - Verificar conexión a internet
   - Usar botón "Actualizar" manualmente

3. **Errores de build**
   - Verificar variables de entorno
   - Ejecutar `pnpm build` localmente

### Logs y debugging

```bash
# Ver logs detallados
DEBUG=* pnpm dev

# Verificar build
pnpm build
pnpm start
```

## 📄 Licencia

MIT License - Ver `LICENSE` para más detalles.

## 🤝 Contribuir

1. Fork el repositorio
2. Crear branch para feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'Agregar nueva funcionalidad'`
4. Push al branch: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

## 📞 Soporte

- **Issues**: GitHub Issues
- **Documentación**: Este README
- **Email**: [tu-email@ejemplo.com]

---

**¿Cuánto es la vaina?** - Porque a veces necesitas saber cuánto vale realmente tu dinero 💰
