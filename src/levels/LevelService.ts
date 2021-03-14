import level from "./Level1";
import Level1 from "./Level1";
import Level2 from "./Level2";
import Level3 from "./Level3";

class LevelService {
  private levels = [Level1, Level2, Level3];

  get levelsCount() {
    return this.levels.length;
  }

  getLevel(level: number) {
    return this.levels[level - 1];
  }
}

const sharedInstance = new LevelService();

export { sharedInstance };
