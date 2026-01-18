# Rocket Engine Simulator — Screen Inventory & Wireframe Guide

This document enumerates all primary UI screens for the Rocket Engine Simulator MVP and campaign flow. Each section describes the **purpose**, **player intent**, **key UI regions**, and **transitions** to guide wireframe creation and implementation.

---

## 1. Boot / Splash Screen

**Purpose**
- Establish tone (technical, startup, playful)
- Load assets and initialize simulation systems

**Key UI Elements**
- Game logo
- Subtle animated exhaust plume / blueprint grid
- Tagline: "Powered by real rocket physics"

**Transitions**
- Auto-advance to Main Menu

---

## 2. Main Menu

**Purpose**
- Primary entry point
- Mode and progression selection

**Key UI Elements**
- New Game
- Continue
- Level Select
- Sandbox Mode (locked until campaign completion)
- Settings
- Credits / Open Source link

**Persistent Info**
- Current difficulty indicator
- Progress summary (World X / Level Y)

**Transitions**
- New Game → Difficulty Selection
- Continue → World Map / Level Brief
- Level Select → World Map
- Settings → Settings Screen

---

## 3. Difficulty Selection

**Purpose**
- Set core simulation rules and failure consequences

**Key UI Elements**
- Four selectable cards:
  - Casual
  - Normal (default)
  - Hard
  - Hardcore (permadeath warning)
- Summary of consequences per mode

**Transitions**
- Confirm → World Intro
- Back → Main Menu

---

## 4. World Intro / Narrative Screen

**Purpose**
- Deliver narrative context
- Establish environment and stakes

**Key UI Elements**
- Isometric background of facility (e.g., Garage, Warehouse)
- Character banter text bubbles
- World theme and learning focus
- Enter Level CTA

**Transitions**
- Enter Level → Level Briefing

---

## 5. Level Briefing Screen

**Purpose**
- Clearly define constraints and success criteria

**Key UI Elements**
- Level title and narrative blurb
- Explicit goals (e.g., thrust, Isp, duration)
- Budget summary:
  - Monetary
  - Weight
  - Complexity
  - Propellant
- Available unlocks/components
- Start Designing button

**Transitions**
- Start Designing → Design Phase
- Back → World Map

---

## 6. Design Phase (Core Screen)

**Purpose**
- Primary gameplay screen for engine construction

**Layout Regions**
1. **Engine Assembly View (Center)**
   - Ensure clear connection points
   - Isometric technical rendering
2. **Component Palette (Left)**
   - Categories, filters, locked items
3. **Inspector Panel (Right)**
   - Selected component properties
   - Sliders and material selectors
4. **Top HUD**
   - Budget meters
   - Goal progress
   - Difficulty indicator
5. **Bottom Controls**
   - Test Fire
   - Save Design
   - Reset

**Transitions**
- Test Fire → Simulation Screen
- Help → Help Overlay

---

## 7. Help / Engineer’s Notes Overlay

**Purpose**
- Contextual learning without interrupting flow

**Key UI Elements**
- Highlighted UI regions
- Plain-language explanations
- Optional Advanced View toggle

**Transitions**
- Dismiss → Return to previous screen

---

## 8. Simulation / Test Fire Screen

**Purpose**
- Execute physics simulation
- Provide spectacle and data

**Key UI Elements**
- Animated engine view
- Particle systems (flows, combustion, exhaust)
- Real-time performance graphs:
  - Thrust
  - Isp
  - Pressure
  - Temperature
- Countdown and status indicators

**Simulation States**
- Countdown
- Running
- Failure
- Shutdown

**Transitions**
- Completion → Results Screen
- Failure → Failure Screen

---

## 9. Failure Screen

**Purpose**
- Diagnose issues and reinforce learning

**Key UI Elements**
- Highlighted failure points on engine
- Diagnostic summary
- Consequences clearly stated
- Suggested improvements

**Transitions**
- Back to Design Phase

---

## 10. Results / Analysis Screen

**Purpose**
- Reflect on performance
- Compare iterations

**Key UI Elements**
- Goal completion checklist
- Performance charts
- Comparison with previous tests
- Budget remaining
- Decision buttons:
  - Iterate
  - Proceed

**Transitions**
- Iterate → Design Phase
- Proceed → Level Complete Screen

---

## 11. Level Complete / Celebration Screen

**Purpose**
- Reward success and reinforce progress

**MVP Elements**
- Success message
- Performance stats
- Budget carryover summary
- Continue / Replay options

**Transitions**
- Continue → Next Level Briefing
- Replay → Design Phase

---

## 12. World Map / Progression Screen

**Purpose**
- Show macro progression and unlocks

**Key UI Elements**
- World nodes and level markers
- Completed levels highlighted
- Upcoming unlock previews

**Transitions**
- Select Level → Level Briefing
- Back → Main Menu

---

## 13. Settings Screen

**Purpose**
- Accessibility and performance configuration

**Key UI Elements**
- Graphics quality (particle detail)
- Audio volume
- Difficulty display
- Advanced View toggle
- Language (future)

**Transitions**
- Back → Previous screen

---

## 14. Sandbox Mode Screen

**Purpose**
- Free experimentation post-campaign

**Key Differences**
- No budgets
- All components unlocked
- Experimental focus

**Transitions**
- Exit → Main Menu

---

*This document is intended to directly drive low- and mid-fidelity wireframe production and Unity UI layout planning.*

