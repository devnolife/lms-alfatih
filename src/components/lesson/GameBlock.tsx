"use client";

import MazeGame from "@/components/lesson/games/MazeGame";
import OrderGame from "@/components/lesson/games/OrderGame";
import MatchGame from "@/components/lesson/games/MatchGame";
import FillBlankGame from "@/components/lesson/games/FillBlankGame";

interface Props {
  type?: string;
  [key: string]: string | undefined;
}

/**
 * Dispatches a `::game{type="..."}` directive to the matching mini-game.
 * Unknown types render nothing (fails safe).
 */
export default function GameBlock({ type, ...rest }: Props) {
  switch (type) {
    case "maze":
      return <MazeGame {...rest} />;
    case "order":
      return <OrderGame {...rest} />;
    case "match":
      return <MatchGame {...rest} />;
    case "fill":
      return <FillBlankGame {...rest} />;
    default:
      return null;
  }
}
