import React from "react";

// Helper function to parse and render Tiptap JSON content
export function renderTiptapContent(content: string): React.JSX.Element {
  // Handle empty or null content
  if (!content || content.trim() === "") {
    return <div className="text-gray-500 italic">No content available</div>;
  }

  // If content doesn't look like JSON, treat as plain text
  if (!content.trim().startsWith("{") && !content.trim().startsWith("[")) {
    return (
      <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed whitespace-pre-wrap">
        {content}
      </div>
    );
  }

  try {
    const jsonContent = JSON.parse(content);

    // Validate that it's a proper TipTap document structure
    if (!jsonContent || typeof jsonContent !== "object") {
      throw new Error("Invalid JSON structure");
    }

    // If it's already a valid TipTap document
    if (jsonContent.type === "doc" && Array.isArray(jsonContent.content)) {
      return <TiptapRenderer content={jsonContent} />;
    }

    // If it's an array of nodes
    if (Array.isArray(jsonContent)) {
      return <TiptapRenderer content={{ type: "doc", content: jsonContent }} />;
    }

    // If it's a single node
    if (jsonContent.type) {
      return (
        <TiptapRenderer content={{ type: "doc", content: [jsonContent] }} />
      );
    }

    // Fallback: treat as plain text
    throw new Error("Unrecognized structure");
  } catch (error) {
    console.warn(
      "Failed to parse TipTap JSON content:",
      error,
      "Content:",
      content
    );

    // Enhanced fallback: try to extract readable text if it contains text
    let fallbackContent = content;
    try {
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === "object") {
        fallbackContent = extractTextFromJsonContent(parsed) || content;
      }
    } catch (e) {
      // Keep original content if can't extract text
    }

    return (
      <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed">
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-3">
          <p className="text-sm text-yellow-800 mb-2">
            <strong>Note:</strong> This content could not be properly formatted
            and is displayed as plain text.
          </p>
        </div>
        <div className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-3 rounded border">
          {fallbackContent}
        </div>
      </div>
    );
  }
}

// Helper function to extract text content from JSON recursively
export function extractTextFromJsonContent(obj: any): string {
  if (!obj) return "";

  if (typeof obj === "string") return obj;

  if (Array.isArray(obj)) {
    return obj
      .map((item) => extractTextFromJsonContent(item))
      .filter(Boolean)
      .join(" ");
  }

  if (typeof obj === "object") {
    // If it has text property, return it
    if (obj.text) return obj.text;

    // If it has content, recurse into it
    if (obj.content) return extractTextFromJsonContent(obj.content);

    // Try to extract from all values
    return Object.values(obj)
      .map((value) => extractTextFromJsonContent(value))
      .filter(Boolean)
      .join(" ");
  }

  return "";
}

// Component to render Tiptap JSON structure
function TiptapRenderer({ content }: { content: any }): React.JSX.Element {
  if (!content || !content.content) {
    return <div className="text-gray-500 italic">No content available</div>;
  }

  return (
    <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed">
      {content.content.map((node: any, index: number) => (
        <TiptapNode key={index} node={node} />
      ))}
    </div>
  );
}

// Component to render individual Tiptap nodes
function TiptapNode({ node }: { node: any }): React.JSX.Element {
  if (!node) return <></>;

  switch (node.type) {
    case "paragraph":
      // Handle empty paragraphs
      if (!node.content || node.content.length === 0) {
        return <p className="mb-2">&nbsp;</p>;
      }
      return (
        <p className="mb-2 leading-relaxed">
          {node.content?.map((child: any, index: number) => (
            <TiptapNode key={index} node={child} />
          ))}
        </p>
      );

    case "text":
      let element = <>{node.text}</>;

      if (node.marks) {
        node.marks.forEach((mark: any) => {
          switch (mark.type) {
            case "bold":
              element = <strong className="font-bold">{element}</strong>;
              break;
            case "italic":
              element = <em className="italic">{element}</em>;
              break;
            case "code":
              element = (
                <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">
                  {element}
                </code>
              );
              break;
            case "link":
              element = (
                <a
                  href={mark.attrs?.href}
                  className="text-blue-600 hover:text-blue-800 underline break-all"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                >
                  {element}
                </a>
              );
              break;
            case "strike":
              element = <s className="line-through">{element}</s>;
              break;
            case "underline":
              element = <u className="underline">{element}</u>;
              break;
          }
        });
      }

      return element;

    case "heading":
      const level = node.attrs?.level || 1;
      const headingClasses = {
        1: "text-3xl font-bold mb-4 mt-6 text-gray-900 border-b pb-2",
        2: "text-2xl font-bold mb-3 mt-5 text-gray-900",
        3: "text-xl font-bold mb-2 mt-4 text-gray-900",
        4: "text-lg font-bold mb-2 mt-3 text-gray-900",
        5: "text-base font-bold mb-1 mt-2 text-gray-900",
        6: "text-sm font-bold mb-1 mt-2 text-gray-900",
      };

      const headingContent = node.content?.map((child: any, index: number) => (
        <TiptapNode key={index} node={child} />
      ));

      switch (level) {
        case 1:
          return <h1 className={headingClasses[1]}>{headingContent}</h1>;
        case 2:
          return <h2 className={headingClasses[2]}>{headingContent}</h2>;
        case 3:
          return <h3 className={headingClasses[3]}>{headingContent}</h3>;
        case 4:
          return <h4 className={headingClasses[4]}>{headingContent}</h4>;
        case 5:
          return <h5 className={headingClasses[5]}>{headingContent}</h5>;
        case 6:
          return <h6 className={headingClasses[6]}>{headingContent}</h6>;
        default:
          return <h1 className={headingClasses[1]}>{headingContent}</h1>;
      }

    case "codeBlock":
      const language = node.attrs?.language || "text";
      return (
        <div className="mb-4">
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto border">
            <code
              className={`language-${language} text-sm font-mono leading-relaxed`}
            >
              {node.content?.map((child: any, index: number) => (
                <TiptapNode key={index} node={child} />
              ))}
            </code>
          </pre>
          {language && language !== "text" && (
            <div className="text-xs text-gray-500 mt-1 text-right">
              {language}
            </div>
          )}
        </div>
      );

    case "bulletList":
      return (
        <ul className="list-disc list-outside ml-6 mb-4 space-y-1">
          {node.content?.map((child: any, index: number) => (
            <TiptapNode key={index} node={child} />
          ))}
        </ul>
      );

    case "orderedList":
      const start = node.attrs?.start || 1;
      return (
        <ol
          className="list-decimal list-outside ml-6 mb-4 space-y-1"
          start={start}
        >
          {node.content?.map((child: any, index: number) => (
            <TiptapNode key={index} node={child} />
          ))}
        </ol>
      );

    case "listItem":
      return (
        <li className="mb-1 leading-relaxed">
          {node.content?.map((child: any, index: number) => (
            <TiptapNode key={index} node={child} />
          ))}
        </li>
      );

    case "blockquote":
      return (
        <blockquote className="border-l-4 border-blue-400 bg-blue-50 pl-4 py-2 my-4 italic text-gray-700 rounded-r">
          {node.content?.map((child: any, index: number) => (
            <TiptapNode key={index} node={child} />
          ))}
        </blockquote>
      );

    case "image":
      const src = node.attrs?.src;
      const alt = node.attrs?.alt || "Image";
      const title = node.attrs?.title;
      const width = node.attrs?.width;
      const height = node.attrs?.height;

      if (!src) return <></>;

      return (
        <div className="my-4">
          <img
            src={src}
            alt={alt}
            title={title}
            width={width}
            height={height}
            className="max-w-full h-auto rounded-lg border shadow-sm hover:shadow-md transition-shadow"
            loading="lazy"
          />
          {title && (
            <div className="text-sm text-gray-600 mt-2 text-center italic">
              {title}
            </div>
          )}
        </div>
      );

    case "hardBreak":
      return <br />;

    case "horizontalRule":
      return <hr className="my-6 border-t-2 border-gray-200" />;

    case "table":
      return (
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full border border-gray-300 rounded-lg">
            <tbody>
              {node.content?.map((child: any, index: number) => (
                <TiptapNode key={index} node={child} />
              ))}
            </tbody>
          </table>
        </div>
      );

    case "tableRow":
      return (
        <tr className="border-b border-gray-200">
          {node.content?.map((child: any, index: number) => (
            <TiptapNode key={index} node={child} />
          ))}
        </tr>
      );

    case "tableCell":
    case "tableHeader":
      const Tag = node.type === "tableHeader" ? "th" : "td";
      const className =
        node.type === "tableHeader"
          ? "px-4 py-2 bg-gray-50 font-semibold text-left border-r border-gray-200"
          : "px-4 py-2 border-r border-gray-200";

      return (
        <Tag className={className}>
          {node.content?.map((child: any, index: number) => (
            <TiptapNode key={index} node={child} />
          ))}
        </Tag>
      );

    default:
      // For unknown node types, try to render content if available
      if (node.content) {
        return (
          <>
            {node.content.map((child: any, index: number) => (
              <TiptapNode key={index} node={child} />
            ))}
          </>
        );
      }
      return <></>;
  }
}

// Export for use in other components
export { TiptapRenderer, TiptapNode };
