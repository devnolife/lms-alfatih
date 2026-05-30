"use client";

interface Props {
  /**
   * Folders and their files. Folders are separated by `|`; each is
   * "FolderName: file1, file2". A file may start with an emoji, e.g.
   * "Gambar: 🖼️ foto.jpg, 🖼️ poster.png | Dokumen: 📄 tugas.docx".
   */
  data?: string;
  /** Heading shown above the tree. */
  title?: string;
  /** Name of the top-level folder. */
  root?: string;
}

interface FileItem {
  emoji: string;
  name: string;
  ext: string;
}
interface Folder {
  name: string;
  files: FileItem[];
}

/** Colour for an extension badge, grouped by file kind. */
function extColor(ext: string): string {
  const e = ext.toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(e)) return "var(--color-grape)";
  if (["doc", "docx", "pdf", "txt"].includes(e)) return "var(--color-sky-blue)";
  if (["mp3", "wav", "ogg"].includes(e)) return "var(--color-duo-green)";
  if (["mp4", "mov", "avi"].includes(e)) return "var(--color-bubblegum)";
  return "var(--color-silver)";
}

function parseFile(raw: string): FileItem {
  const t = raw.trim();
  // Split a leading emoji (non-alphanumeric run) from the filename.
  const m = t.match(/^(\P{L}*?)\s*([\w.-]+)$/u);
  const emoji = m ? m[1].trim() : "";
  const name = m ? m[2] : t;
  const dot = name.lastIndexOf(".");
  const ext = dot >= 0 ? name.slice(dot + 1) : "";
  return { emoji: emoji || "📄", name, ext };
}

function parseData(data: string): Folder[] {
  return data
    .split("|")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const idx = p.indexOf(":");
      const name = idx >= 0 ? p.slice(0, idx).trim() : p.trim();
      const files =
        idx >= 0
          ? p
              .slice(idx + 1)
              .split(",")
              .map((f) => f.trim())
              .filter(Boolean)
              .map(parseFile)
          : [];
      return { name, files };
    });
}

/**
 * Shows a folder hierarchy: a root folder containing sub-folders, each holding
 * files with a colour-coded extension badge. Teaches that folders group similar
 * files and that the extension marks a file's kind. Pure render from props.
 */
export default function FolderTree({
  data = "Gambar: 🖼️ foto.jpg, 🖼️ poster.png | Dokumen: 📄 tugas.docx | Musik: 🎵 lagu.mp3",
  title = "Folder menyimpan berkas",
  root = "Berkas-Ku",
}: Props) {
  const folders = parseData(data);

  return (
    <div className="not-prose my-5 rounded-2xl border-2 border-[var(--color-cloud)] bg-white p-4">
      <div className="mb-3 text-[10px] font-bold uppercase tracking-wide text-[var(--color-silver)]">
        {title}
      </div>

      <div className="font-mono text-sm">
        <div className="flex items-center gap-2 font-bold text-[var(--color-charcoal)]">
          <span aria-hidden>📂</span>
          <span>{root}</span>
        </div>

        <div className="ml-3 border-l-2 border-[var(--color-cloud)] pl-3">
          {folders.map((f, i) => (
            <div key={i} className="mt-2 first:mt-1">
              <div className="flex items-center gap-2 font-bold text-[var(--color-sky-blue-dark)]">
                <span aria-hidden>📁</span>
                <span>{f.name}</span>
                <span className="text-[10px] font-semibold text-[var(--color-silver)]">
                  ({f.files.length} berkas)
                </span>
              </div>

              <div className="ml-2 border-l-2 border-[var(--color-cloud)] pl-3">
                {f.files.map((file, j) => (
                  <div
                    key={j}
                    className="mt-1.5 flex items-center gap-2 text-[var(--color-graphite)]"
                  >
                    <span aria-hidden>{file.emoji}</span>
                    <span className="font-semibold text-[var(--color-charcoal)]">
                      {file.name}
                    </span>
                    {file.ext && (
                      <span
                        className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white"
                        style={{ background: extColor(file.ext) }}
                      >
                        .{file.ext}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
