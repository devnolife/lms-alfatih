"use client";

import type { ComponentProps, ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import remarkDirectives from "@/lib/markdown/remarkDirectives";
import Callout from "@/components/lesson/Callout";
import VisualBlock from "@/components/lesson/VisualBlock";
import GameBlock from "@/components/lesson/GameBlock";
import ConceptReveal from "@/components/lesson/ConceptReveal";
import ScratchEmbed from "@/components/lesson/ScratchEmbed";
import FileRescueMission from "@/components/lesson/FileRescueMission";
import { ActivityProvider } from "@/components/lesson/ActivityContext";

interface Props {
  body: string;
  lessonSlug?: string;
}

type CalloutType = "tip" | "info" | "warning" | "concept";

const components = {
  h2: (props: ComponentProps<"h2">) => (
    <h2
      className="mt-8 mb-3 text-2xl font-bold text-[var(--color-charcoal)]"
      style={{ fontFamily: "var(--font-feather)" }}
      {...props}
    />
  ),
  h3: (props: ComponentProps<"h3">) => (
    <h3
      className="mt-6 mb-2 text-xl font-bold text-[var(--color-charcoal)]"
      style={{ fontFamily: "var(--font-feather)" }}
      {...props}
    />
  ),
  p: (props: ComponentProps<"p">) => (
    <p className="my-3 leading-relaxed text-[var(--color-almost-black)]" {...props} />
  ),
  ul: (props: ComponentProps<"ul">) => (
    <ul className="my-3 ml-5 list-disc space-y-1" {...props} />
  ),
  ol: (props: ComponentProps<"ol">) => (
    <ol className="my-3 ml-5 list-decimal space-y-1" {...props} />
  ),
  a: (props: ComponentProps<"a">) => (
    <a
      className="text-[var(--color-sky-blue-dark)] underline underline-offset-2"
      {...props}
    />
  ),
  strong: (props: ComponentProps<"strong">) => (
    <strong className="font-bold text-[var(--color-duo-green-dark)]" {...props} />
  ),
  blockquote: (props: ComponentProps<"blockquote">) => (
    <blockquote
      className="my-4 border-l-4 border-[var(--color-sky-blue)] bg-[var(--color-sky-blue-light)] px-4 py-2 italic"
      {...props}
    />
  ),
  table: (props: ComponentProps<"table">) => (
    <div className="my-4 overflow-x-auto">
      <table
        className="w-full border-collapse text-sm [&_td]:border [&_td]:border-[var(--color-cloud)] [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:border-[var(--color-cloud)] [&_th]:bg-[var(--color-duo-green-light)] [&_th]:px-3 [&_th]:py-2"
        {...props}
      />
    </div>
  ),
  pre: (props: ComponentProps<"pre">) => (
    <pre
      className="my-4 overflow-x-auto rounded-2xl bg-[#1e1e1e] px-4 py-3 text-sm leading-relaxed text-white"
      {...props}
    />
  ),
  code: ({
    className,
    children,
    ...props
  }: ComponentProps<"code"> & { children?: ReactNode }) => {
    const isBlock = /language-/.test(className ?? "");
    if (isBlock) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code
        className="rounded-md bg-[var(--color-cloud)] px-1.5 py-0.5 font-mono text-[0.85em] text-[var(--color-bubblegum)]"
        {...props}
      >
        {children}
      </code>
    );
  },
  // Custom directives
  callout: ({
    type,
    title,
    children,
  }: {
    type?: string;
    title?: string;
    children?: ReactNode;
  }) => (
    <Callout type={(type as CalloutType) ?? "tip"} title={title}>
      {children}
    </Callout>
  ),
  visual: (props: { type?: string; [key: string]: string | undefined }) => (
    <VisualBlock {...props} />
  ),
  game: (props: { type?: string; [key: string]: string | undefined }) => (
    <GameBlock {...props} />
  ),
  scratch: (props: { projectId?: string; [key: string]: string | undefined }) => (
    <ScratchEmbed {...props} />
  ),
  filemission: (props: {
    missionKey?: string;
    [key: string]: string | undefined;
  }) => <FileRescueMission {...props} />,
  reveal: ({
    visual,
    title,
    children,
    ...rest
  }: {
    visual?: string;
    title?: string;
    children?: ReactNode;
    [key: string]: string | ReactNode | undefined;
  }) => (
    <ConceptReveal visual={visual} title={title} {...rest}>
      {children}
    </ConceptReveal>
  ),
} as Components;

export default function LessonContent({ body, lessonSlug }: Props) {
  return (
    <ActivityProvider value={{ lessonSlug }}>
      <div className="text-[var(--color-almost-black)]">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkDirective, remarkDirectives]}
          components={components}
        >
          {body.endsWith("\n") ? body : `${body}\n`}
        </ReactMarkdown>
      </div>
    </ActivityProvider>
  );
}
