<pre><code class="language-mermaid">flowchart TD
    Splash --&gt; MainMenu

    MainMenu --&gt;|New Game| Difficulty
    Difficulty --&gt; WorldIntro
    WorldIntro --&gt; WorldMap

    MainMenu --&gt;|Continue| WorldMap
    MainMenu --&gt;|Level Select| WorldMap
    MainMenu --&gt;|Settings| Settings

    WorldMap --&gt; LevelBrief
    LevelBrief --&gt; Design

    Design --&gt;|Help| HelpOverlay
    HelpOverlay --&gt; Design

    Design --&gt;|Test Fire| Simulation

    Simulation --&gt;|Success| Results
    Simulation --&gt;|Failure| Failure

    Failure --&gt;|Back to Design| Design

    Results --&gt;|Iterate| Design
    Results --&gt;|Proceed| LevelComplete

    LevelComplete --&gt; WorldMap

    WorldMap --&gt;|Sandbox Unlocked| Sandbox
    Sandbox --&gt; Design

    Settings --&gt; MainMenu
</code></pre><p></p>