import {
  Triangle,
  Settings,
  CircleDashed,
  Scissors,
  Armchair,
  MoveHorizontal,
} from "lucide-react";

const MAP = {
  Triangle,
  Settings,
  CircleDashed,
  Scissors,
  Armchair,
  MoveHorizontal,
};

// Fine-line single-color illustrated icon (strokeWidth=2 for better legibility)
export const PartIcon = ({ name, size = 48, color = "var(--color-icon-stroke)", className = "" }) => {
  const Cmp = MAP[name] ?? Triangle;
  return (
    <Cmp size={size} strokeWidth={2} color={color} className={className} />
  );
};

export default PartIcon;
