flowchart TD
    Splash --> MainMenu

    MainMenu -->|New Game| Difficulty
    Difficulty --> WorldIntro
    WorldIntro --> WorldMap

    MainMenu -->|Continue| WorldMap
    MainMenu -->|Level Select| WorldMap
    MainMenu -->|Settings| Settings

    WorldMap --> LevelBrief
    LevelBrief --> Design

    Design -->|Help| HelpOverlay
    HelpOverlay --> Design

    Design -->|Test Fire| Simulation

    Simulation -->|Success| Results
    Simulation -->|Failure| Failure

    Failure -->|Back to Design| Design

    Results -->|Iterate| Design
    Results -->|Proceed| LevelComplete

    LevelComplete --> WorldMap

    WorldMap -->|Sandbox Unlocked| Sandbox
    Sandbox --> Design

    Settings --> MainMenu
