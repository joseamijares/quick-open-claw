# ClawdBot LATAM 🤖

> Tu asistente de IA en 60 segundos. Sin código, sin configuración, sin API keys (opcional).

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

## ¿Qué es ClawdBot?

ClawdBot es una plataforma que permite desplegar asistentes de IA en Telegram con un solo clic. Usando [OpenClaw](https://openclaw.ai) bajo el capó, cualquier persona puede tener su propio asistente inteligente sin conocimientos técnicos.

**Características principales:**

- ⚡ **60 segundos** — De clic a asistente funcionando
- 🤖 **Ollama incluido** — Usa Llama 3.2 sin pagar API keys
- 💬 **Telegram nativo** — Conecta tu bot en minutos
- 🔒 **Tu servidor** — Contenedor aislado en VPS dedicado
- 💰 **Precios LATAM** — Desde $99 MXN/mes
- 🛠️ **Open Source** — Auto-hostea gratis o usa nuestro servicio

## Stack

- **Frontend:** Next.js 14 (App Router), Tailwind CSS
- **Auth & DB:** Supabase
- **Payments:** Stripe
- **Email:** Loops
- **VPS:** Hetzner Cloud
- **Containers:** Docker + OpenClaw

## Desarrollo Local

```bash
# Clonar repo
git clone https://github.com/joseamijares/clawdbot-latam.git
cd clawdbot-latam

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales

# Correr migraciones en Supabase
# (Copiar contenido de supabase/migrations/001_initial_schema.sql al SQL Editor)

# Iniciar servidor de desarrollo
npm run dev
```

## Auto-Hosting

ClawdBot es open source bajo licencia AGPL-3.0. Puedes auto-hostear todo el stack:

1. Fork este repositorio
2. Despliega en Vercel (frontend)
3. Crea un proyecto en Supabase (base de datos)
4. Configura tu cuenta de Hetzner (VPS)
5. Añade tus propias API keys

## Estructura

```
clawdbot-latam/
├── src/
│   ├── app/           # Next.js App Router
│   │   ├── api/       # API routes
│   │   ├── auth/      # Auth pages
│   │   └── dashboard/ # Dashboard
│   ├── components/    # React components
│   ├── lib/           # Utils (Supabase, Stripe, Hetzner)
│   └── types/         # TypeScript types
├── supabase/
│   └── migrations/    # SQL migrations
└── infra/             # Terraform + Ansible (coming soon)
```

## Planes

| Plan | Precio | Modelo | API Key |
|------|--------|--------|---------|
| Starter | $99 MXN/mo | Llama 3.2 (Ollama) | No necesaria |
| Pro | $199 MXN/mo | Haiku/GPT-4o-mini | La tuya |
| Premium | $399 MXN/mo | Sonnet/GPT-4o | La tuya |

## Contribuir

¡Contribuciones bienvenidas! Por favor lee nuestras guías:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/algo-increible`)
3. Commit tus cambios (`git commit -m 'Añade algo increíble'`)
4. Push a la rama (`git push origin feature/algo-increible`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la licencia [AGPL-3.0](LICENSE). Esto significa:

- ✅ Puedes usar, modificar y distribuir el código
- ✅ Puedes auto-hostear para ti o tu empresa
- ⚠️ Si modificas y distribuyes, debes publicar el código fuente
- ⚠️ Si ofreces como servicio (SaaS), debes publicar el código fuente

## Hecho por

**JAMAK AI** — [jamaklab.com](https://jamaklab.com)

Hecho con ❤️ en México 🇲🇽
