# Smart Kitchen MVP

Browser MVP for the connected side of a smart cooking appliance — what an owner sees once the
device is on the network, rather than the appliance's own front panel.

## Screens

| Route | What it shows |
|---|---|
| `Dashboard` | Fleet/device overview at a glance |
| `LiveData` | Streaming telemetry off the device |
| `Diagnostics` | Health and fault state for remote troubleshooting |
| `Recipes` | Cooking programmes available on the device |

Built with React + Vite + TypeScript, Tailwind and shadcn/ui. Layout primitives live in
`src/components/layout/`.

## Why it exists

The appliance ships as a standalone product; this is the argument for treating it as a
connected one. Telemetry turns into usage analytics, remote diagnostics and predictive
maintenance, which is what makes a device platform worth more than the hardware it runs on.

## Running it

```bash
npm install
npm run dev
```

End-to-end tests run under Playwright:

```bash
npx playwright test
```
