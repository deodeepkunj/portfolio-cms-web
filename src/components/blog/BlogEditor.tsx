"use client";

import React, { useMemo } from "react";
import JoditEditor from "jodit-react";

type Props = {
  value: string;
  onChange: (data: string) => void;
};

export default function BlogEditor({ value, onChange }: Props) {
  const config = useMemo(
    () => ({
      readonly: false,
      height: 500,
      placeholder: "Start writing your blog content...",
      toolbarAdaptive: false,
      toolbarSticky: true,
      toolbarStickyOffset: 64,
      showCharsCounter: true,
      showWordsCounter: true,
      showXPathInStatusbar: false,
      askBeforePasteHTML: false,
      askBeforePasteFromWord: false,
      defaultActionOnPaste: "insert_clear_html",

      buttons: [
        "source",
        "|",
        "bold",
        "italic",
        "underline",
        "strikethrough",
        "superscript",
        "subscript",
        "|",
        "fontsize",
        "brush",
        "paragraph",
        "|",
        "ul",
        "ol",
        "outdent",
        "indent",
        "|",
        "align",
        "lineHeight",
        "|",
        "link",
        "image",
        "video",
        "file",
        "table",
        "|",
        "hr",
        "copyformat",
        "find",
        "|",
        "undo",
        "redo",
        "|",
        "selectall",
        "cut",
        "copy",
        "paste",
        "|",
        "preview",
        "print"
      ],

      /**
       * Enable all formatting options
       */
      paragraph: {
        p: "Paragraph",
        h1: "Heading 1",
        h2: "Heading 2",
        h3: "Heading 3",
        h4: "Heading 4",
        h5: "Heading 5",
        h6: "Heading 6",
        blockquote: "Blockquote",
        pre: "Code block",
      },

      /**
       * Image settings
       */
      image: {
        insertAsBase64URI: true, // later replace with upload API
      },

      /**
       * Clean HTML output (SEO friendly)
       */
      cleanHTML: {
        fillEmptyParagraph: false,
        removeEmptyElements: true,
      },
    }),
    []
  );

  return (
    <div className="border rounded-md overflow-hidden bg-white dark:bg-gray-900">
      <JoditEditor
        value={value}
        config={config}
        onBlur={(newContent) => onChange(newContent)}
      />
    </div>
  );
}
