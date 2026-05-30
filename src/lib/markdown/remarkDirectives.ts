import { visit } from "unist-util-visit";
import type { Plugin } from "unified";
import type { Root } from "mdast";

/**
 * Converts remark-directive nodes into custom hast elements so they can be
 * mapped to React components by react-markdown.
 *
 * Markdown authoring examples:
 *   :::callout{type="tip" title="Ingat ya!"}
 *   Isi callout di sini.
 *   :::
 *
 *   ::visual{type="variable-box" name="umur" value="13"}
 */
const remarkDirectives: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, (node) => {
      if (
        node.type === "containerDirective" ||
        node.type === "leafDirective" ||
        node.type === "textDirective"
      ) {
        const directive = node as unknown as {
          name: string;
          attributes?: Record<string, string | null | undefined>;
          data?: {
            hName?: string;
            hProperties?: Record<string, unknown>;
          };
        };
        const data = directive.data || (directive.data = {});
        data.hName = directive.name;
        data.hProperties = { ...(directive.attributes ?? {}) };
      }
    });
  };
};

export default remarkDirectives;
