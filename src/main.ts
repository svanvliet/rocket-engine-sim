import { Game } from './core/Game';
import { SplashScreen } from './screens/SplashScreen';
import { MainMenuScreen } from './screens/MainMenuScreen';
import { DifficultyScreen } from './screens/DifficultyScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { WorldIntroScreen } from './screens/WorldIntroScreen';
import { LevelBriefScreen } from './screens/LevelBriefScreen';
import { DesignScreen } from './screens/DesignScreen';
import { SimulationScreen } from './screens/SimulationScreen';
import { ResultsScreen } from './screens/ResultsScreen';
import { LevelCompleteScreen } from './screens/LevelCompleteScreen';

async function main() {
  const game = Game.getInstance();
  await game.init();

  // Register all screens
  game.registerScreen('splash', new SplashScreen());
  game.registerScreen('mainMenu', new MainMenuScreen());
  game.registerScreen('difficulty', new DifficultyScreen());
  game.registerScreen('settings', new SettingsScreen());
  game.registerScreen('worldIntro', new WorldIntroScreen());
  game.registerScreen('levelBrief', new LevelBriefScreen());
  game.registerScreen('design', new DesignScreen());
  game.registerScreen('simulation', new SimulationScreen());
  game.registerScreen('results', new ResultsScreen());
  game.registerScreen('levelComplete', new LevelCompleteScreen());

  // Start with splash screen
  await game.switchScreen('splash');
}

main().catch(console.error);
