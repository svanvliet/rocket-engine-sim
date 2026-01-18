# Game Design Questions for Discussion

## Platform & Technical

1. **Target Platform**: What is your preferred platform for this game?
   - [x] PC (Windows/Mac/Linux)
   - [x] Web browser (HTML5/WebGL)
   - [x] Mobile (iOS/Android)
   - [ ] Console
   - [x] Multiple platforms
   
   **ANSWER**: Target platforms are PC, Web, and Mobile.

2. **Development Technology**: Do you have preferences for the game engine or framework?
   - Unity, Godot, custom engine, web-based (Three.js, Canvas)?
   
   **ANSWER**: Unity may be most robust, but open to WebGL if it can deliver compelling visuals and snappy performance. Priority is really cool animations including particle systems for propellant flows and exhaust plumes. Framework choice should consider this requirement.

3. **Multiplayer/Social**: Should players be able to:
   - Share designs with others?
   - Compete on leaderboards?
   - Have asynchronous challenges?
   - Real-time collaboration?
   
   **ANSWER**: Leaderboards and design sharing would be great features. Add to GDD as post-MVP features, not for first version.

## Gameplay Depth

4. **Complexity Level**: How deep should the physics simulation go?
   - Simplified/arcade (accessibility focus)
   - Realistic (engineering focus)
   - Variable difficulty settings?
   
   **ANSWER**: Realistic feel but not overburdening. Introduce a slider or variable setting for realism that keeps gameplay fun without becoming onerous.

5. **Time Pressure**: Should there be time-based challenges?
   - Design timer limits?
   - Real-time countdown during tests?
   - Or purely turn-based strategy?
   
   **ANSWER**: Time pressure tied to difficulty setting. Higher difficulty introduces time limits and real-time countdown challenges (e.g., timing mini-game during countdown sequence to chill engines at right timing).

6. **Failure Consequences**: When a test fails, should:
   - Components be damaged/destroyed (requiring replacement cost)?
   - Just consume propellant budget?
   - Affect reputation/rating system?
   
   **ANSWER**: Failure consequences tied to difficulty setting (3-4 levels). Hardest "Hardcore" mode: failure ends game. Generally, failed tests reduce propellant budget or damage/destroy components (consequences increase through levels). Players can earn more budget through mini-games relevant to rockets/space theme.

7. **Free Play vs Guided**: After completing a level, should players:
   - Be forced to move to next level?
   - Be able to replay for better scores?
   - Have side objectives/optional challenges?
   
   **ANSWER**: Players must start at level 1 first time. After unlocking levels, can start new games from any unlocked level (with minimum budget for that level). When progressing naturally, spare budget carries over between levels (incentivizes continuous play). After passing a level, player can choose to progress or "start this level again" to beat current run.

## Progression & Content

8. **Campaign Length**: How many total levels are you envisioning?
   - Current draft shows 25 levels across 5 worlds
   - Should there be more? Fewer?
   - Endless mode?
   
   **ANSWER**: 25 levels across 5 worlds is good. Add notable visual changes as players progress through worlds: start in tinkerer's garage/school workshop, progress to SpaceX-quality test facility in Master world.

9. **Difficulty Curve**: Should difficulty increase through:
   - Tighter budgets?
   - More complex goals?
   - More failure modes to avoid?
   - Time pressure?
   - All of the above?
   
   **ANSWER**: All of the above.

10. **Unlocks Philosophy**: Should players unlock components by:
    - Linear progression (level-based)?
    - Performance-based (achieve specific metrics)?
    - Currency/points system (spend to unlock)?
    - Research tree?
    
    **ANSWER**: Use linear progression (level-based). Add appendix to GDD for "Other Unlock Philosophies to Consider" with expanded details.

## Visual & Presentation

11. **Camera Control**: Should the player be able to:
    - Rotate the isometric view?
    - Zoom in/out?
    - Fixed isometric view only?
    
    **ANSWER**: Isometric camera default. Players can zoom on components: scroll wheel (PC/Mac/Browser) or pinch-to-zoom (mobile). Note: Browser only if not using Unity.

12. **Color Palette**: For the line art style, what colors should represent:
    - Fuel lines?
    - Oxidizer lines?
    - Hot gases?
    - Cold cryogenic propellants?
    - Structural elements?
    
    **ANSWER**: 
    - Fuel lines: Red hue
    - Oxidizer lines: Purple hue
    - Hot gases: Orange hue
    - Cold cryogenic propellants: Ice blue (with frosty effect on lines when under cryo load if possible)
    - Structural elements: Various grey and metallic colors depending on materials (Inconel = nickel color, GRCop = copper color)

13. **Animation Detail**: How detailed should the flow animations be?
    - Simple particle trails?
    - Complex fluid simulation visualization?
    - Abstract representation?
    
    **ANSWER**: Variable setting in game menu. Complex fluid visualization for high-end clients with great graphics, simple particle trails for older clients. Settings could be a slider with ~3 levels.

14. **Component Visualization**: Should components:
    - Show internal structure (cutaway view)?
    - Be abstract symbolic representations?
    - Detailed technical drawings?
    
    **ANSWER**: Primary view is moderately accurate technical 3D rendering. When player zooms on a part, show zoomed view with option to toggle cutaway view of internal structure.

## Educational Focus

15. **Target Education Level**: What level of physics/engineering knowledge should be assumed?
    - High school level?
    - Undergraduate engineering?
    - General public with no background?
    
    **ANSWER**: Assume general public education level for first 1-2 worlds, then progressively more complex. Final world should be challenging but not require engineering degree. Include help feature that explains concepts when first introduced.

16. **Formula Display**: Should the game show:
    - Actual equations used in calculations?
    - Just results and graphs?
    - Optional "advanced mode" with math?
    
    **ANSWER**: Make this an optional "Advanced View" that shows actual rocket equations and math powering the graphs.

17. **Real-World Data**: Should the game include:
    - Exact specifications of real engines as reference?
    - Historical missions to recreate?
    - Modern engine challenges (Raptor, Merlin, etc.)?
    
    **ANSWER**: Yes, provide real-world data as examples for benchmarking and in help features where relevant.

## Game Feel & Polish

18. **Pace**: What's the intended session length?
    - Quick 5-minute levels?
    - Deep 30+ minute design sessions?
    - Variable?
    
    **ANSWER**: Very accessible to get into. Player should assemble first engine and run simulation within first 5-10 minutes. Tutorial in level 1 gives pre-assembled engine needing a few parts added/connections fixed. Test runs but doesn't perform well. Player told "I bet you could help us! Why don't we start again with your help?" This allows quick jump-in but sets up fresh start.

19. **Feedback Style**: Should the game be:
    - Serious/professional (NASA simulator feel)?
    - Playful/encouraging (game-first approach)?
    - Blend of both?
    
    **ANSWER**: Blend of both. Include sarcastic and witty, but not mean, banter.

20. **Success Celebration**: When players achieve goals, should there be:
    - Simple success screen?
    - Elaborate celebrations?
    - Comparison to real-world engines?
    - Unlock cinematics?
    
    **ANSWER**: Start with simple success screen. Add ideas to appendix for future versions with more advanced celebration concepts.

## Monetization & Distribution

21. **Business Model**: What's your vision for distribution?
    - Free/open source?
    - Paid game (one-time purchase)?
    - Free-to-play with optional purchases?
    - Educational licensing?
    
    **ANSWER**: Free to play and open source.

22. **Accessibility**: Should the game include:
    - Difficulty settings?
    - Colorblind modes?
    - Text-to-speech for educational content?
    - Multiple language support?
    
    **ANSWER**: Start with English for now. (Difficulty settings covered in other answers.)

## Scope & Priorities

23. **MVP Features**: For a minimum viable product, which features are MUST-HAVE vs nice-to-have?
    - Core gameplay loop first?
    - Tutorial system priority?
    - Visual polish priority?
    
    **ANSWER**: MVP must demonstrate core gameplay loop. Tutorial mode is nice-to-have for MVP. Visual polish can come later.

24. **Narrative/Context**: Should there be:
    - A story mode with narrative?
    - Just pure gameplay with technical goals?
    - Career/company management layer?
    - Historical timeline to follow?
    
    **ANSWER**: Story: Player is space fan given chance to join rocket builder team at startup. Be snarky about how much money founders raised but need to show progress quickly for next funding round (cheeky play on startup world). Focus on gameplay and technical goals, but story of career and startup is fun background narrative driving gameplay.

25. **End Game**: After completing all levels, what should keep players engaged?
    - Sandbox mode only?
    - Community challenges?
    - Procedurally generated challenges?
    - Custom scenario creator?
    
    **ANSWER**: End game can be celebration of success and roll game credits for now.

---

## Open Questions

- **Name**: Is "Rocket Engine Simulator" the working title, or do you have other ideas?
  - **ANSWER**: "Rocket Engine Simulator" is good for now.

- **Unique Selling Point**: What makes this different from other engineering games (Kerbal Space Program, SimpleRockets, etc.)?
  - **TBD**: To be defined during development

- **Inspiration**: Are there specific games or simulations you want to emulate or avoid?
  - **TBD**: To be defined during development

- **Audio Importance**: How important is the sound design vs focusing on visual and gameplay first?
  - **ANSWER**: Audio and sound effects are important elements of the game, but for MVP can use minimal sound elements to get going.

- **Modding**: Should the game support user-created content/mods?
  - **TBD**: To be defined during development

---

**All questions answered! Ready to update main GDD.**
