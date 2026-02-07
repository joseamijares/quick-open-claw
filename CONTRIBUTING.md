# Contributing to QuickOpenClaw

Thanks for your interest in contributing! 🎉

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- A Supabase account (free tier works)
- A Stripe account (test mode)

### Local Development

1. **Fork and clone the repo**
   ```bash
   git clone https://github.com/YOUR_USERNAME/quick-open-claw.git
   cd quick-open-claw
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Then fill in your values (see comments in `.env.example`).

4. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to SQL Editor and run the migration:
     ```
     supabase/migrations/001_initial_schema.sql
     ```
   - Copy your project URL and keys to `.env.local`

5. **Run the dev server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## Pull Request Process

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make your changes
3. Run linting: `npm run lint`
4. Commit with a descriptive message
5. Push and open a PR

## Code Style

- TypeScript strict mode
- Tailwind for styling
- shadcn/ui components when possible
- Keep components small and focused

## Security

⚠️ **Never commit secrets or API keys!**

- All secrets go in `.env.local` (gitignored)
- Use environment variables for all sensitive data
- Report security issues privately to security@jamaklab.com

## Questions?

Open an issue or join our Discord community.

---

Made with ❤️ by JAMAK AI
