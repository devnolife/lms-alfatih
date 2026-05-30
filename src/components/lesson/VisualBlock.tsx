"use client";

import VariableBox from "@/components/lesson/visualizers/VariableBox";
import LoopStepper from "@/components/lesson/visualizers/LoopStepper";
import PrintFlow from "@/components/lesson/visualizers/PrintFlow";
import ConditionFlow from "@/components/lesson/visualizers/ConditionFlow";
import StepSequence from "@/components/lesson/visualizers/StepSequence";
import FlowchartDiagram from "@/components/lesson/visualizers/FlowchartDiagram";

interface Props {
  type?: string;
  [key: string]: string | undefined;
}

/**
 * Dispatches an `::visual{type="..."}` directive to the matching interactive
 * concept visualizer. Unknown types render nothing (fails safe).
 */
export default function VisualBlock({ type, ...rest }: Props) {
  switch (type) {
    case "variable-box":
      return <VariableBox {...rest} />;
    case "loop-stepper":
      return <LoopStepper {...rest} />;
    case "print-flow":
      return <PrintFlow {...rest} />;
    case "condition-flow":
      return <ConditionFlow {...rest} />;
    case "step-sequence":
      return <StepSequence {...rest} />;
    case "flowchart-diagram":
      return <FlowchartDiagram {...rest} />;
    default:
      return null;
  }
}
