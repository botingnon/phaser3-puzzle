import * as Colors from "../const/Color";

const boxColorToTargetColor = (boxColor: number): number => {
  switch (boxColor) {
    default:
    case Colors.BoxRed:
      return Colors.TargetRed;
    case Colors.BoxOrange:
      return Colors.TargetOrange;
    case Colors.BoxGrey:
      return Colors.TargetGrey;
    case Colors.BoxGreen:
      return Colors.TargetGreen;
    case Colors.BoxBlue:
      return Colors.TargetBlue;
  }
};

const targetColorToBoxColor = (targetColor: number): number => {
  switch (targetColor) {
    default:
    case Colors.TargetRed:
      return Colors.BoxRed;
    case Colors.TargetOrange:
      return Colors.BoxOrange;
    case Colors.TargetGrey:
      return Colors.BoxGrey;
    case Colors.TargetGreen:
      return Colors.BoxGreen;
    case Colors.TargetBlue:
      return Colors.BoxBlue;
  }
};

export { boxColorToTargetColor, targetColorToBoxColor };
