"use client";

import MazeGame from "@/components/lesson/games/MazeGame";
import OrderGame from "@/components/lesson/games/OrderGame";
import MatchGame from "@/components/lesson/games/MatchGame";
import FillBlankGame from "@/components/lesson/games/FillBlankGame";
import QuizGame from "@/components/lesson/games/QuizGame";
import FlowchartGame from "@/components/lesson/games/FlowchartGame";
import FileSortGame from "@/components/lesson/games/FileSortGame";
import HardwareMatchGame from "@/components/lesson/games/HardwareMatchGame";
import SpreadsheetGame from "@/components/lesson/games/SpreadsheetGame";
import BranchingGame from "@/components/lesson/games/BranchingGame";
import TeachableMachineGame from "@/components/lesson/games/TeachableMachineGame";
import { ActivityProvider } from "@/components/lesson/ActivityContext";

interface Props {
  type?: string;
  activityId?: string;
  [key: string]: string | undefined;
}

function renderGame(type: string | undefined, rest: Record<string, string | undefined>) {
  switch (type) {
    case "maze":
      return <MazeGame {...rest} />;
    case "order":
      return <OrderGame {...rest} />;
    case "match":
      return <MatchGame {...rest} />;
    case "fill":
      return <FillBlankGame {...rest} />;
    case "quiz":
      return <QuizGame {...rest} />;
    case "flowchart":
      return <FlowchartGame {...rest} />;
    case "filesort":
      return <FileSortGame {...rest} />;
    case "hardware":
      return <HardwareMatchGame {...rest} />;
    case "spreadsheet":
      return <SpreadsheetGame {...rest} />;
    case "branching":
      return <BranchingGame {...rest} />;
    case "teachable":
      return <TeachableMachineGame {...rest} />;
    default:
      return null;
  }
}

/**
 * Dispatches a `::game{type="..."}` directive to the matching mini-game.
 * Unknown types render nothing (fails safe). When the directive declares an
 * `activityId`, the game is wrapped so solving it reports completion.
 */
export default function GameBlock({ type, activityId, ...rest }: Props) {
  const game = renderGame(type, rest);
  if (activityId) {
    return <ActivityProvider value={{ activityId }}>{game}</ActivityProvider>;
  }
  return game;
}
