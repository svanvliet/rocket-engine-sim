# Rocket Engine Simulator - Game Design Document

## High Concept
An educational and strategic simulation game where players design, build, and test liquid rocket engines using real-world physics principles, balancing budget constraints against performance goals through progressively challenging levels. Set in a startup rocket company narrative with witty banter and real-world engineering challenges.

---

## Game Overview

### Genre
- Educational Simulation
- Engineering Puzzle
- Strategy/Resource Management

### Target Audience
- Aerospace enthusiasts
- Engineering students
- Strategy/simulation game players
- Ages 14+

### Platform
- **Primary Platforms**: PC (Windows/Mac/Linux), Web Browser, Mobile (iOS/Android)
- **Technology Stack**: TypeScript + PixiJS (WebGL-based 2D engine with excellent particle effects support)
- **Distribution Model**: Free-to-play, open source

### Core Experience
Players experience the thrill and challenge of rocket engineering by making meaningful trade-offs between cost, weight, performance, and reliability while learning real rocket science principles through hands-on experimentation. Set in a startup environment, players join a scrappy rocket builder team racing to show progress for their next funding round, creating a fun and relatable backdrop for the technical challenges.

### Narrative Hook
You're a space fan who's been given an opportunity to join a team of rocket builders at a promising startup. The founders raised a ton of money from VCs, but now they need to show real progress—fast—if they want to get to the next funding round. Through witty and sarcastic (but not mean) banter, the team guides you through increasingly complex engineering challenges as you work together to build the next generation of rocket engines.

---

## Core Game Loop

1. **Select Level** - Choose from available levels with specific goals
2. **Design Phase** - Select and configure engine components within budget constraints
3. **Assembly** - Place components to build the engine
4. **Simulation** - Run test fire to see performance metrics
5. **Analyze Results** - Review thrust curves, efficiency, and goal achievement
6. **Iterate or Progress** - Adjust design or advance to next level

---

## Gameplay Mechanics

### Difficulty System
Players choose difficulty at game start (3-4 difficulty levels):

#### Casual Mode
- Forgiving failure consequences
- No time pressure
- Simplified physics simulation
- Failed tests only consume propellant budget

#### Normal Mode (Default)
- Moderate failure consequences: component damage possible
- Optional time challenges
- Realistic physics with accessibility
- Failed tests can damage components or reduce propellant budget (consequences increase through levels)

#### Hard Mode
- Strict failure consequences: components can be destroyed
- Time pressure on most levels
- Real-time countdown mini-games (e.g., timing mini-game to chill engines at correct intervals)
- Higher complexity in physics simulation

#### Hardcore Mode
- **Permadeath**: Failed test ends the game
- All Hard Mode challenges
- Maximum simulation complexity
- For expert players only

### Budget System
Players must work within multiple constraint types:
- **Monetary Budget**: Cost of components and materials
- **Weight Budget**: Total engine mass affects performance
- **Complexity Budget**: More complex designs may require higher manufacturing capability
- **Propellant Budget**: Amount of fuel available for test

#### Budget Mechanics
- **Budget Carryover**: When progressing naturally through levels, spare budget carries over to next level (incentivizes continuous play)
- **Level Select**: When starting a new game from an unlocked level, player receives minimum budget for that level
- **Earning Extra Budget**: Complete themed mini-games related to rockets/space to earn additional budget
- **Failure Costs**: Based on difficulty mode, failures reduce propellant budget and can damage/destroy components requiring replacement

### Component System

#### Core Components (Level 1 - Basic)
- **Combustion Chamber**: Where fuel and oxidizer mix and burn
  - Variables: Size, material, cooling method
- **Nozzle**: Converts thermal energy to kinetic energy
  - Variables: Expansion ratio, throat diameter, material
- **Fuel Injector**: Delivers propellant to combustion chamber
  - Variables: Pattern (impinging, swirl, shower), flow rate
- **Turbopump**: Pressurizes propellant
  - Variables: Power, pressure ratio, efficiency
- **Propellant Tanks**: Store fuel and oxidizer
  - Variables: Capacity, pressure rating, material

#### Advanced Components (Unlocked in Later Levels)
- Regenerative cooling systems
- Thrust vector control
- Pre-burners (staged combustion)
- Advanced nozzle designs (aerospike, plug)
- Ignition systems
- Throttle control mechanisms

### Material System
Different materials offer trade-offs:
- **Basic Metals**: Steel, aluminum - cheap, heavy, lower performance
- **Advanced Alloys**: Titanium, inconel - expensive, lighter, heat-resistant
- **Exotic Materials**: Carbon composites, ceramics - very expensive, optimal performance
- **Cooling Methods**: Film cooling, regenerative cooling, ablative

### Propellant Types
Various fuel/oxidizer combinations with different characteristics:
- **RP-1/LOX**: Dense, good performance, coking issues
- **LH2/LOX**: High specific impulse, low density, cryogenic challenges
- **Methane/LOX**: Good balance, deep-space capable
- **Hypergolic**: Storable, toxic, reliable ignition
- Each affects: Isp, density, storage requirements, cost, handling complexity

### Physics Simulation
Real-world parameters calculated:
- **Thrust**: Force generated
- **Specific Impulse (Isp)**: Fuel efficiency
- **Chamber Pressure**: Combustion pressure
- **Expansion Ratio**: Nozzle optimization for altitude
- **Thermal Loads**: Heat management requirements
- **Flow Rates**: Propellant consumption
- **Thrust-to-Weight Ratio**: Engine efficiency
- **Failure Probability**: Based on design complexity and testing

---

## Progression System

### Level Progression Rules
1. **First Playthrough**: Players must start at Level 1
2. **Unlocking**: Completing a level unlocks it for future playthroughs
3. **Level Select**: From main menu, players can start new games at any unlocked level
4. **Completion Choice**: After passing a level's goals, players can:
   - Progress to next level (budget carries over)
   - Restart current level to beat their run (budget resets to level minimum)
5. **Continuous Play Advantage**: Playing through levels sequentially allows budget carryover, providing strategic advantage

### Level Structure

#### World 1: The Garage (Levels 1-5)
**Visual Environment**: Tinkerer's garage or school workshop—cramped, improvised, enthusiastic
**Theme**: Sea-level static test stand, basic components, learning fundamentals
**Narrative**: Your first days at the startup. The team is scrappy and working out of someone's garage.

**Goals**: 
- Level 1: Achieve 100 kN thrust at sea level (Tutorial level)
- Level 2: Achieve 150 kN with <500 kg engine mass
- Level 3: Maintain 200 kN thrust for 30 seconds
- Level 4: Achieve Isp > 300s
- Level 5: Design reliable engine (3 successful tests in a row)

**Unlocks**: Basic materials, simple cooling, RP-1/LOX and Methane/LOX
**Education Level**: General public—concepts explained clearly when first introduced

#### World 2: The Warehouse (Levels 6-10)
**Visual Environment**: Small industrial warehouse—still modest but more professional equipment
**Theme**: Optimize for efficiency, introduce staging concepts
**Narrative**: The startup got some early traction! You've moved into a real facility.

**Goals**:
- Maximize specific impulse
- Minimize propellant consumption
- Balance thrust and efficiency
- Introduce throttling requirements

**Unlocks**: Regenerative cooling, advanced injectors, LH2/LOX, better materials
**Education Level**: Intermediate—building on fundamentals, introducing more technical concepts

#### World 3: The Test Facility (Levels 11-15)
**Visual Environment**: Dedicated test facility—outdoor test stands, proper infrastructure, serious equipment
**Theme**: Vacuum-optimized engines, expansion ratios
**Narrative**: Series A funding secured! You now have access to a real test facility with altitude simulation.

**Goals**:
- Optimize for vacuum performance
- Design dual-mode engines (sea level + vacuum)
- Extreme expansion ratios
- Lightweight construction

**Unlocks**: Large nozzles, aerospike designs, composite materials
**Education Level**: Advanced—complex engineering trade-offs, multiple system interactions

#### World 4: The Campus (Levels 16-20)
**Visual Environment**: Corporate campus—multiple test stands, mission control, impressive but not quite top-tier
**Theme**: Staged combustion, expander cycles, complex architectures
**Narrative**: Series B complete! The company is growing fast. Time to prove you can compete with the big names.

**Goals**:
- Implement staged combustion cycle
- Achieve extreme chamber pressures
- Multi-chamber designs
- Reusability considerations

**Unlocks**: Pre-burners, advanced turbomachinery, exotic materials
**Education Level**: Expert—sophisticated concepts, but still explained accessibly

#### World 5: SpaceX-Tier Facility (Levels 21-25)
**Visual Environment**: World-class test facility—SpaceX/Blue Origin quality, cutting-edge equipment, impressive scale
**Theme**: Open-ended challenges, extreme constraints, mastery
**Narrative**: You've made it! The company is now competing with SpaceX and Blue Origin. Time to show what you can really do.

**Goals**:
- Budget-constrained optimization
- Minimal mass designs
- Maximum performance
- Custom scenarios
- Replicate real-world engines (Merlin, Raptor, RS-25)

**Unlocks**: All components and materials
**Education Level**: Challenging but achievable—no engineering degree required, but demands mastery of concepts

### Unlock System
**Primary System**: Linear progression (level-based)
- New components unlock after completing specific levels
- Materials unlock as players progress through worlds
- Advanced features unlock through level completion
- Straightforward and predictable progression path

See **Appendix B: Alternative Unlock Philosophies** for other approaches considered for future versions

### Achievement/Mastery System
- **Speed Achievements**: Complete level in minimal iterations
- **Efficiency Stars**: Exceed goals by significant margins
- **Budget Master**: Complete with budget remaining
- **Innovation Awards**: Discover unusual but effective combinations
- **Historical Recreations**: Match real-world engine specs

---

## Visual Design

### Art Style: Isometric Technical Rendering
- **Primary View**: Moderately accurate 3D technical rendering of components
- Clean, engineering-focused aesthetic
- Functional color palette with meaning
- Focus on clarity and educational value

### Camera System
- **Default View**: Fixed isometric perspective
- **Zoom Controls**: 
  - PC/Mac/Browser: Mouse scroll wheel
  - Mobile: Pinch-to-zoom gestures
- **Component Inspection**: When zoomed on a component:
  - Detailed component view
  - Toggle button for cutaway view showing internal structure
  - Technical specifications overlay

### Visual Elements

#### Static View (Design Phase)
- Wireframe/line art representation of components
- Clear labels and dimensions
- Connection points highlighted
- Component properties displayed on selection

#### Dynamic View (Simulation Phase)

**Particle System Requirements** (Key technical requirement influencing Unity vs WebGL decision):
- High-performance particle systems for propellant flows
- Complex fluid visualization on capable hardware
- Smooth animation at 60 FPS

**Animation Detail Settings** (3-level slider in game menu):
1. **Low**: Simple particle trails, basic animations
2. **Medium**: Moderate particle density, smooth flows
3. **High**: Complex fluid simulation visualization, maximum particles

**Propellant Flow Animation**: 
- Particle systems showing fuel/oxidizer flow through injectors
- Flow rate indicated by particle density and animation speed
- **Color-coded flows**:
  - **Fuel lines**: Red hue
  - **Oxidizer lines**: Purple hue
  - **Hot gases**: Orange hue
  - **Cold cryogenic propellants**: Ice blue with frosty effect when under cryo load
  
**Combustion Visualization**:
- Energetic particle patterns in combustion chamber
- Heat intensity shown through particle density and animation
- Temperature gradients indicated by color transitions
  
**Exhaust Plume**:
- Expanding particle patterns showing gas expansion
- Plume shape reflecting nozzle design and pressure
- Shock diamonds visible in appropriate conditions
- Flow separation if over/under-expanded
- Dynamic particle behavior based on physics simulation

#### Performance Overlays
- Temperature heat maps (color-coded)
- Pressure distribution visualization
- Stress/load indicators on components
- Failure warnings (red highlights)
- **Material-Specific Rendering**:
  - Structural components colored by material type
  - Steel/Aluminum: Grey tones
  - Inconel: Nickel-silver color
  - GRCop: Copper color
  - Titanium: Light metallic blue-grey
  - Carbon composites: Matte black with carbon fiber pattern

### UI Elements
- Clean, technical interface with startup aesthetic
- Real-time performance graphs during simulation
- Component selection palette with filtering/search
- Budget/constraint meters (monetary, weight, complexity, propellant)
- Goal progress indicators
- **Optional "Advanced View" Toggle**: Shows actual rocket equations and math powering the graphs
- Difficulty setting indicator
- Current world/level display
- Quick access to help system

---

## Audio Design

### MVP Audio (Minimal but Present)
- Basic mechanical assembly sounds during design phase
- Ignition sequence countdown with voice/beeps
- Engine test roar (intensity varies with thrust)
- Warning alarms for failures
- Simple success sound for goal achievement

### Full Audio (Post-MVP)
- Detailed mechanical assembly sounds
- Cryogenic flow sounds (hissing, bubbling)
- Turbopump spooling
- Different engine sounds based on propellant type
- Ambient test stand/facility sounds that evolve through worlds
- Voice acting for narrative characters with witty dialogue
- Atmospheric music during design phase
- Dynamic music that intensifies during countdown/test

---

## Core Systems

### Tutorial System

#### Level 1 Tutorial Flow (5-10 minute introduction)
1. **Pre-assembled Engine**: Player is shown a partially assembled engine
2. **Quick Fix**: Add a few parts or fix some connections (guided)
3. **First Test**: Run simulation—it works but performs poorly
4. **Narrative Hook**: NPC says "I bet you could help us! Why don't we start again with your help?"
5. **Fresh Start**: Player now builds engine from scratch with guidance
6. **Success**: Complete Level 1 goals and progress

#### Ongoing Help System
- **Contextual Tooltips**: Explaining components and concepts as encountered
- **Help Feature**: In-depth explanations when new concepts are introduced
- **Engineer's Notes**: Real-world context and examples
- **Real-World Benchmarks**: Compare designs to actual engines (Merlin, Raptor, RS-25, RD-180)
- **Optional Advanced Tips**: For experienced players, including formula views

### Testing & Iteration
- Players can test designs multiple times
- Each test consumes propellant budget
- Test data saved for comparison
- "Quick test" option for faster iteration (less detailed)

### Failure System

#### Failure Causes
- Inadequate cooling
- Excessive pressure/thermal loads
- Material limits exceeded
- Design flaws
- Improper propellant flow rates

#### Failure Consequences (Difficulty-Dependent)
**Casual Mode**:
- Consumes propellant budget only
- Detailed diagnostic information
- No permanent damage

**Normal Mode**:
- May damage components (repair costs)
- Reduces propellant budget
- Increasing consequences as levels progress

**Hard Mode**:
- Can destroy components (replacement required)
- Significant propellant budget loss
- Time penalties

**Hardcore Mode**:
- **Game Over** on any test failure
- Must restart from last checkpoint/level

#### Learning from Failures
- Detailed diagnostic readouts
- Visual indicators showing failure points
- Comparison data from previous tests
- Suggestions for improvement
- Catastrophic failures vs degraded performance clearly differentiated

### Data & Analytics
- Detailed performance charts
- Comparison with previous designs
- Historical data tracking
- Export performance reports

### Sandbox Mode
- Unlocked after completing main campaign
- No budget constraints
- All components available
- Experimentation encouraged
- **Future Feature**: Share designs with community (post-MVP)

---

## Educational Elements

### Integrated Learning

#### Progressive Complexity
- **Worlds 1-2**: General public education level, clear explanations
- **Worlds 3-4**: Intermediate concepts building on fundamentals
- **World 5**: Advanced challenges that don't require engineering degree but demand mastery

#### Learning Features
- Real physics calculations (realistic but accessible)
- Technical terms explained when first introduced
- Contextual help feature for deeper dives
- Historical engine examples as references (Merlin, Raptor, RS-25, RD-180, F-1, etc.)
- Real-world benchmarking data for comparison
- "Did you know?" facts about rocket engineering
- Optional "Advanced View" with actual equations
- Links to further reading (optional, external)

### Real-World Connections
- Reference real engines (Merlin, RS-25, RD-180, Raptor, etc.)
- Historical context for different designs
- Modern challenges in rocket engineering
- Career pathways information

---

## Replayability

### Multiple Solution Paths
- No single "correct" design for most levels
- Trade-offs create variety in approaches
- Optimization challenges for returning players

### Challenge Modes
- Speed run mode (complete in fewest iterations)
- Efficiency mode (maximize performance/cost ratio)
- Minimalist mode (achieve goal with minimal components)
- Historical accuracy mode (recreate real engines)

### Community Features (Post-MVP)
These features are planned for future versions:
- Share designs (export/import codes)
- Leaderboards for each level (various metrics)
- Community challenges
- Design competitions
- User-created scenarios

---

## Technical Considerations

### Platform Technology Decision

**DECISION: TypeScript + PixiJS**

After evaluation, a web-based stack using TypeScript and PixiJS has been selected for the following reasons:

**Primary Justification:**
1. **100% Code-Based Development**: No IDE or visual editor required—entire game can be built through code, enabling AI-assisted development
2. **Excellent Particle Systems**: PixiJS provides high-performance WebGL particle effects suitable for propellant flow and exhaust plume animations
3. **Multi-Platform Support**: Runs natively in any browser; can be wrapped with Electron (desktop) or Capacitor (mobile) for native apps
4. **Lightweight Builds**: WebGL builds are typically 5-15 MB (vs 50-150 MB for Unity WebGL)
5. **Open Source Friendly**: All tools are MIT/Apache licensed with no revenue restrictions

**Implementation Details:**
- **Language**: TypeScript 5.x for type safety and maintainability
- **Rendering**: PixiJS 8.x for WebGL-accelerated 2D graphics
- **Build Tool**: Vite for fast development and optimized production builds
- **Particle System**: @pixi/particle-emitter for complex effects
- **Audio**: Howler.js for cross-browser audio support
- **State Management**: Custom TypeScript classes with event-driven architecture
- **Deployment**: Static hosting on GitHub Pages, itch.io, or any CDN

**Trade-offs Accepted:**
- Custom physics implementation required (not a game engine physics system)—acceptable since rocket physics are specialized calculations anyway
- No visual scene editor—mitigated by clean code architecture and hot reloading
- Mobile performance requires optimization—handled through quality settings and responsive design

### Physics Engine
**Simulation Complexity** (adjustable per difficulty setting):
- Real-time calculation of:
  - Thrust and Isp
  - Tsiolkovsky rocket equation
  - Nozzle flow equations (isentropic flow)
  - Heat transfer
  - Pressure dynamics
  - Mass flow rates
  - Chamber pressure and temperature
- Balance accuracy with performance and accessibility
- Simplified models for complex phenomena
- Difficulty setting controls simulation depth:
  - Casual: Simplified calculations, fewer failure modes
  - Normal: Realistic with some abstractions
  - Hard/Hardcore: Maximum realism within playability

### Save System
- Save/load game files (continuous progression with budget carryover)
- Individual design saves per level
- Progress tracking (levels unlocked, achievements)
- Achievement/unlock persistence
- Design library for comparing iterations
- Cloud save support (future feature)

### Performance
- Target 60 FPS for all animations
- Responsive UI (< 100ms interaction latency)
- Quick simulation iterations (< 5 seconds for standard test)
- Scalable particle complexity (3-tier setting)
- Mobile optimization (touch-friendly UI, performance scaling)
- Browser optimization (lightweight PixiJS builds, lazy loading for assets)

### Settings & Accessibility
- **Graphics Quality**: 3-tier slider (Low/Medium/High particle detail)
- **Difficulty**: 4 modes (Casual/Normal/Hard/Hardcore)
- **Advanced View**: Toggle for showing equations
- **Language**: English for MVP, multi-language support in future
- **Audio**: Volume controls, minimal audio for MVP
- **Controls**: Mouse/keyboard (PC), touch (mobile), gamepad support (future)

---

## Monetization

**Business Model**: Free-to-play, open source
- No monetization for initial release
- All content freely available
- Open source code repository
- Community contributions encouraged
- Future: Optional donations, cosmetic DLC, or educational licensing (TBD)

---

## Success Metrics

### Player Engagement
- Level completion rates
- Average time per level
- Replay frequency
- Sandbox mode usage

### Learning Outcomes
- Player understanding of key concepts (surveys/quizzes)
- Ability to explain trade-offs
- Recognition of real-world applications

### Community Growth
- Design sharing frequency
- Community challenge participation
- Social media engagement

---

## Development Phases (High-Level)

### MVP (Minimum Viable Product)
**Goal**: Demonstrate core gameplay loop
**Timeline**: TBD

**Must-Have Features**:
- Core physics engine (Normal difficulty)
- Basic component system (World 1 components minimum)
- World 1: The Garage (5 levels)
- Basic particle system for propellant/exhaust visualization
- Isometric camera with zoom
- Simple UI with budget tracking
- Basic failure system
- Level progression and save/load
- Minimal audio (key sound effects only)
- Startup narrative framework

**Nice-to-Have for MVP**:
- Tutorial system (Level 1 guided experience)
- Help system with concept explanations
- Multiple difficulty modes
- Settings menu (graphics quality, audio volume)

**Explicitly Post-MVP**:
- Full 25-level campaign
- All 5 worlds with environment progression
- Community features (leaderboards, design sharing)
- Advanced audio and voice acting
- Mini-games for earning budget
- Sandbox mode
- Advanced celebrations and polish

### Phase 1: Prototype (Pre-MVP)
- Core physics engine proof-of-concept
- Basic component system (3-5 components)
- Single test level
- Simple particle visualization
- Technology stack decision (Unity vs WebGL)

### Phase 2: MVP Development
- Implement must-have features above
- World 1 complete and playable
- Basic polish pass
- Internal testing

### Phase 3: Alpha
- Worlds 1-3 complete (15 levels)
- Tutorial system polished
- All difficulty modes
- Enhanced audio
- Mini-game prototypes
- External playtesting

### Phase 4: Beta
- All 5 worlds (25 levels)
- All components and materials
- Visual environment progression complete
- Community features implemented
- Full audio design
- Narrative fully integrated

### Phase 5: Launch Preparation
- Polish and optimization across all platforms
- Performance tuning (mobile, web)
- Final testing
- Documentation (for open source)
- Marketing materials
- Community setup (Discord, GitHub, etc.)

### Phase 6: Launch
- Release on GitHub
- Web deployment
- App store submissions (mobile)
- Community engagement
- Bug tracking and rapid response

### Phase 7: Post-Launch
- Community feedback integration
- Bug fixes and balance updates
- Additional content based on player feedback
- Educational partnerships
- Potential: Workshop/mod support
- Potential: Additional worlds or campaigns

---

## Appendix

### Key Terms Glossary
- **Specific Impulse (Isp)**: Measure of rocket engine efficiency
- **Thrust**: Force generated by engine
- **Chamber Pressure**: Pressure inside combustion chamber
- **Expansion Ratio**: Ratio of nozzle exit area to throat area
- **Regenerative Cooling**: Using propellant to cool engine
- **Staged Combustion**: Pre-burning some propellant to drive turbopumps
- **Thrust-to-Weight**: Ratio of thrust to engine mass

### References for Development
- "Rocket Propulsion Elements" by Sutton & Biblarz
- NASA technical reports
- SpaceX, Blue Origin, and other modern engine data
- Historical engine documentation

---

## Appendix A: Success Celebration Ideas (Future Versions)

### Simple Success Screen (MVP)
- Goal completion message
- Performance statistics
- "Continue" or "Replay Level" buttons
- Budget remaining displayed

### Enhanced Celebrations (Post-MVP)
- Performance comparison to real-world engines
- Unlock cinematics showing new components/materials
- Team reaction animations/dialogue
- Achievement unlocks with fanfare
- Social sharing options
- Replay highlights showing best moments from test
- Engineering analysis breakdown
- Hall of Fame for exceptional designs

---

## Appendix B: Alternative Unlock Philosophies to Consider

While the game uses **linear progression (level-based)** for simplicity and clear goals, future versions could explore these alternatives:

### Performance-Based Unlocks
**Concept**: Unlock components by achieving specific performance metrics

**Implementation**:
- Achieve Isp > 350s → Unlock advanced nozzle designs
- Complete test with 0 failures → Unlock reliability upgrades
- Minimize cost per kN thrust → Unlock budget components
- Maximize thrust-to-weight ratio → Unlock lightweight materials

**Pros**: 
- Rewards mastery and optimization
- Encourages experimentation
- More player agency

**Cons**: 
- Can be frustrating if unlock feels arbitrary
- May block progression unfairly
- Harder to balance

### Currency/Points System
**Concept**: Earn "Research Points" to unlock components in any order

**Implementation**:
- Earn points by completing levels, achieving goals, discovering optimal designs
- Spend points on unlock tree
- Player chooses which tech path to pursue

**Pros**: 
- Maximum player choice
- Encourages replayability
- Personalized progression

**Cons**: 
- Can be overwhelming
- Risk of "bad builds" blocking progress
- More complex to balance

### Research Tree
**Concept**: Tech tree with branching paths and prerequisites

**Implementation**:
- Multiple tech branches (cooling, injectors, propellants, materials)
- Unlock prerequisites before advanced tech
- Some exclusive choices (forcing specialization)

**Pros**: 
- Strategic depth
- Meaningful choices
- High replayability

**Cons**: 
- Complex for casual players
- Could confuse educational goals
- Requires extensive balancing

### Hybrid System
**Concept**: Combine multiple approaches

**Implementation Example**:
- Base components unlock linearly (ensures progression)
- Bonus components unlock via performance achievements
- Special components require research points
- Secret components discovered through experimentation

**Pros**: 
- Balances accessibility and depth
- Rewards multiple playstyles
- High engagement

**Cons**: 
- Most complex to implement
- Hardest to balance
- Could feel bloated

**Recommendation for Future**: Consider **Performance-Based Unlocks** as first enhancement to linear system—adds depth without overwhelming complexity.

---

## Appendix C: Mini-Game Concepts for Earning Budget

Mini-games should be quick (30-90 seconds), theme-appropriate, and optional.

### Proposed Mini-Games

**1. Trajectory Optimization**
- Simple orbital mechanics puzzle
- Plot efficient transfer orbit
- Rewards: Bonus monetary budget

**2. Fuel Loading Sequence**
- Timing-based mini-game
- Press buttons in correct sequence to load propellants safely
- Rewards: Bonus propellant budget

**3. Component Inspection**
- Spot-the-difference between damaged and pristine parts
- Helps avoid bad components
- Rewards: Component discount voucher

**4. Thermal Management**
- Balance cooling flows in real-time
- Keep temperatures in safe zones
- Rewards: Cooling system discount

**5. Telemetry Analysis**
- Read graphs and diagnose issues quickly
- Educational pattern recognition
- Rewards: Free diagnostic tool use

**6. Ignition Timing**
- Rhythm game for engine startup sequence
- Time the ignition perfectly
- Rewards: Bonus test propellant

**Implementation Note**: Mini-games should be skippable and optional. Players shouldn't feel forced to play them to progress.

---

## Appendix D: Technical Reference

### Key Rocket Engine Equations (for "Advanced View")

**Thrust Equation**:
```
F = ṁ * Ve + (Pe - Pa) * Ae
Where:
F = Thrust
ṁ = Mass flow rate
Ve = Exhaust velocity
Pe = Exit pressure
Pa = Ambient pressure
Ae = Exit area
```

**Specific Impulse**:
```
Isp = F / (ṁ * g0)
Where:
Isp = Specific impulse (seconds)
F = Thrust
ṁ = Mass flow rate
g0 = Standard gravity (9.81 m/s²)
```

**Ideal Exhaust Velocity**:
```
Ve = √[(2 * γ * R * Tc / (γ - 1) * M) * (1 - (Pe/Pc)^((γ-1)/γ))]
Where:
γ = Specific heat ratio
R = Gas constant
Tc = Chamber temperature
M = Molecular mass
Pe = Exit pressure
Pc = Chamber pressure
```

**Tsiolkovsky Rocket Equation**:
```
Δv = Isp * g0 * ln(m0 / mf)
Where:
Δv = Change in velocity
m0 = Initial mass
mf = Final mass
```

**Nozzle Expansion Ratio**:
```
ε = Ae / At
Where:
ε = Expansion ratio
Ae = Exit area
At = Throat area
```

### Real-World Engine Reference Data

| Engine | Organization | Thrust (kN) | Isp (s) | Chamber Pressure (bar) | Propellant | Cycle |
|--------|--------------|-------------|---------|------------------------|------------|--------|
| Merlin 1D | SpaceX | 845 | 282 (SL) / 311 (Vac) | 97 | RP-1/LOX | Gas Generator |
| Raptor 2 | SpaceX | 2,300 | 327 (SL) / 350+ (Vac) | 300 | CH4/LOX | Full-Flow Staged Combustion |
| RS-25 | NASA/Aerojet | 1,860 | 366 (SL) / 452 (Vac) | 204 | LH2/LOX | Staged Combustion |
| RD-180 | NPO Energomash | 3,827 | 311 (SL) / 338 (Vac) | 258 | RP-1/LOX | Staged Combustion |
| BE-4 | Blue Origin | 2,400 | 310 (SL) / 350 (Vac) | 135 | CH4/LOX | Staged Combustion |
| F-1 | Rocketdyne | 6,770 | 263 (SL) / 304 (Vac) | 70 | RP-1/LOX | Gas Generator |

---

**Document Version**: 2.1  
**Last Updated**: 2026-01-18  
**Status**: Ready for development - Unity confirmed as engine  
**Next Steps**: Begin Unity project setup and MVP prototype development
