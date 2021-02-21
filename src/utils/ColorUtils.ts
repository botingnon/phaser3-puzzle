import * as Colors from "../const/Color";

const boxColorToTargetColor = (boxColor: number) => {
  switch (boxColor) {
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

export { boxColorToTargetColor };
