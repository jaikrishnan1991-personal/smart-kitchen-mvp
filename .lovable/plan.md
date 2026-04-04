
# Smart Cooking Appliance — Full Demo App (MVP)

## Overview
A polished web-based demo app for an IoT cooking appliance with a built-in FSM simulator, real-time visualization, recipe management, and diagnostics. Clean modern light UI designed for investor/OEM demos. Simple email auth via Lovable Cloud.

## Pages & Features

### 1. Auth (Login/Signup)
- Email + password authentication via Lovable Cloud
- Redirect to Dashboard after login

### 2. Dashboard (Main Screen)
- **FSM State Indicator** — large status badge showing current state (IDLE, PRE_HEAT, DISPENSE, DWELL_PRIMARY, FLIP, DWELL_SECONDARY, EJECT, etc.) with color coding (Blue=Idle, Yellow=Preheat, Green=Active, Red=Error)
- **Temperature Cards** — Zone A and Zone B with current temp, target temp, and mini sparkline
- **Motor Status Cards** — Dispenser RPM and Conveyor RPM with live gauges
- **Cycle Progress Bar** — visual progress through the cooking cycle
- **Active Recipe Name** displayed prominently
- **Control Buttons** — Start, Pause, Stop, and a prominent Emergency Stop button
- **Simulation Toggle** — switch between "Simulation Mode" (auto-running) and "Manual Mode" (step-through states)

### 3. Real-Time Visualization Page
- **Live Temperature Graph** — dual-line chart (Zone A/B) with time axis using Recharts
- **Motor Speed Graph** — RPM over time for both motors
- **State Transition Timeline** — vertical timeline log showing FSM state changes with timestamps

### 4. Recipe/Profile Management
- List of saved recipes with preset badges (Soft / Medium / Crisp)
- Create/Edit recipe form:
  - Temperature targets (Zone A, Zone B)
  - Dwell times (primary, secondary)
  - Motor speeds (dispenser, conveyor)
  - Dispense duration
  - Flip enable/disable toggle
- 3 built-in sample recipes pre-loaded

### 5. Diagnostics & Alerts Page
- **Active Faults** panel with fault codes (Motor Stall, Overheat, Sensor Failure) and suggested actions
- **Fault History** log table
- **Maintenance Alerts** section
- **OTA Update Card** — shows firmware version, update available indicator, trigger update button with progress bar

### 6. Notifications
- Toast notifications for: cycle complete, errors, maintenance alerts
- Notification bell icon in header with dropdown

## Built-in Simulator Engine
- TypeScript state machine that cycles through FSM states with realistic timing
- Simulates temperature ramp-up/cool-down curves
- Generates fake encoder RPM data with slight noise
- Fault injection button (simulate motor stall, overheat, sensor failure)
- All data flows through a React context provider so any component can subscribe

## Navigation
- Sidebar layout with: Dashboard, Live Data, Recipes, Diagnostics
- Header with app name, simulation mode indicator, notification bell, user menu

## Tech Approach
- React + Vite + Tailwind + shadcn/ui components
- Recharts for graphs
- React Context for simulator state management
- Lovable Cloud for auth + storing recipes in database
- No external MQTT or backend services needed — all simulation runs client-side
