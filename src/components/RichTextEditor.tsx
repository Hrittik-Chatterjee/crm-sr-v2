import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Bold, Italic, Undo2, Type } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { boldMap, italicMap, boldItalicMap, normalMap } from "@/components/utils/character-maps";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your social media post content here...",
  rows = 4,
  className = "",
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [activeBold, setActiveBold] = useState(false);
  const [activeItalic, setActiveItalic] = useState(false);
  const [activeBoldItalic, setActiveBoldItalic] = useState(false);
  const previousValueRef = useRef<string>(value);

  // Convert text using a character map
  const convertText = (map: Record<string, string>) => (text: string): string => {
    return Array.from(text)
      .map((char) => map[char] || char)
      .join("");
  };

  // Convert styled text back to normal ASCII
  const toNormal = convertText(normalMap);

  // Apply formatting to selected text
  const applyFormatting = (styleMap: Record<string, string>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // If no text is selected, do nothing
    if (start === end) return;

    // Save current state to history
    setHistory((prev) => [...prev, value]);

    const selectedText = value.substring(start, end);

    // First normalize the text (remove any existing styling)
    const normalizedText = toNormal(selectedText);

    // Then apply the new style
    const styledText = convertText(styleMap)(normalizedText);

    // Replace the selected text with styled text
    const newValue = value.substring(0, start) + styledText + value.substring(end);
    previousValueRef.current = newValue; // Update ref to prevent auto-formatting interference
    onChange(newValue);

    // Restore focus and selection after state update
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + styledText.length);
    }, 0);
  };

  // Handle undo
  const handleUndo = () => {
    if (history.length === 0) return;

    const previousValue = history[history.length - 1];
    previousValueRef.current = previousValue; // Update ref to prevent auto-formatting interference
    onChange(previousValue);
    setHistory((prev) => prev.slice(0, -1));

    // Restore focus
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  // Text case transformations
  const applyCaseTransformation = (transformFn: (text: string) => string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // If no text is selected, do nothing
    if (start === end) return;

    // Save current state to history
    setHistory((prev) => [...prev, value]);

    const selectedText = value.substring(start, end);
    const transformedText = transformFn(selectedText);

    // Replace the selected text with transformed text
    const newValue = value.substring(0, start) + transformedText + value.substring(end);
    previousValueRef.current = newValue; // Update ref to prevent auto-formatting interference
    onChange(newValue);

    // Restore focus and selection after state update
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + transformedText.length);
    }, 0);
  };

  // Sentence case: First letter uppercase, rest lowercase
  const toSentenceCase = (text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  // Capitalize case: First letter of each word uppercase
  const toCapitalizedCase = (text: string): string => {
    return text
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Update previousValueRef when value changes externally (e.g., form reset)
  useEffect(() => {
    previousValueRef.current = value;
  }, [value]);

  // Handle textarea changes with auto-formatting for active modes
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const textarea = textareaRef.current;

    if (!textarea) {
      onChange(newValue);
      return;
    }

    // If no active formatting, just update normally
    if (!activeBold && !activeItalic && !activeBoldItalic) {
      previousValueRef.current = newValue;
      onChange(newValue);
      return;
    }

    // Detect newly typed characters
    const oldValue = previousValueRef.current;
    const cursorPos = textarea.selectionStart;

    // Check if this is a simple insertion (typing)
    if (newValue.length > oldValue.length) {
      const insertPos = cursorPos - (newValue.length - oldValue.length);
      const beforeInsert = newValue.substring(0, insertPos);
      const inserted = newValue.substring(insertPos, cursorPos);
      const afterInsert = newValue.substring(cursorPos);

      // Apply active formatting to newly typed characters
      let formattedInsert = inserted;

      // Normalize first to remove any existing styling
      formattedInsert = toNormal(formattedInsert);

      // Apply active formatting (only one can be active at a time due to mutual exclusivity)
      if (activeBoldItalic) {
        formattedInsert = convertText(boldItalicMap)(formattedInsert);
      } else if (activeBold) {
        formattedInsert = convertText(boldMap)(formattedInsert);
      } else if (activeItalic) {
        formattedInsert = convertText(italicMap)(formattedInsert);
      }

      const formattedValue = beforeInsert + formattedInsert + afterInsert;
      previousValueRef.current = formattedValue;
      onChange(formattedValue);

      // Restore cursor position
      setTimeout(() => {
        const newCursorPos = insertPos + formattedInsert.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    } else {
      // For deletions or other changes, just update normally
      previousValueRef.current = newValue;
      onChange(newValue);
    }
  };

  // Toggle handlers for formatting buttons
  const handleBoldToggle = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // If text is selected, apply formatting to selection
    if (start !== end) {
      applyFormatting(boldMap);
    } else {
      // Toggle active state and deactivate others
      setActiveBold(!activeBold);
      setActiveItalic(false);
      setActiveBoldItalic(false);
    }
  };

  const handleItalicToggle = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // If text is selected, apply formatting to selection
    if (start !== end) {
      applyFormatting(italicMap);
    } else {
      // Toggle active state and deactivate others
      setActiveItalic(!activeItalic);
      setActiveBold(false);
      setActiveBoldItalic(false);
    }
  };

  const handleBoldItalicToggle = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // If text is selected, apply formatting to selection
    if (start !== end) {
      applyFormatting(boldItalicMap);
    } else {
      // Toggle active state and deactivate others
      setActiveBoldItalic(!activeBoldItalic);
      setActiveBold(false);
      setActiveItalic(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextareaChange}
        rows={rows}
        placeholder={placeholder}
        className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 pb-12 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
      />

      {/* Floating Toolbar - positioned at bottom of textarea */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1 p-1 rounded-md border bg-background/95 backdrop-blur-sm shadow-sm">
        <TooltipProvider delayDuration={300}>
          {/* Bold Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleBoldToggle}
                className={cn(
                  "h-8 px-2",
                  activeBold
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Bold className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Bold (click to toggle or select text)</p>
            </TooltipContent>
          </Tooltip>

          {/* Italic Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleItalicToggle}
                className={cn(
                  "h-8 px-2",
                  activeItalic
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Italic className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Italic (click to toggle or select text)</p>
            </TooltipContent>
          </Tooltip>

          {/* Bold + Italic Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleBoldItalicToggle}
                className={cn(
                  "h-8 px-2",
                  activeBoldItalic
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <div className="flex items-center gap-0.5">
                  <Bold className="h-4 w-4" />
                  <Italic className="h-4 w-4" />
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Bold + Italic (click to toggle or select text)</p>
            </TooltipContent>
          </Tooltip>

          {/* Divider */}
          <div className="w-px h-6 bg-border mx-1" />

          {/* Text Case Dropdown */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onMouseDown={(e) => e.preventDefault()}
                    className="h-8 px-2 hover:bg-accent hover:text-accent-foreground"
                  >
                    <Type className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Change text case (select text first)</p>
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="start">
              <DropdownMenuItem
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyCaseTransformation(toSentenceCase)}
              >
                <span className="text-sm">Sentence case</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyCaseTransformation((text) => text.toLowerCase())}
              >
                <span className="text-sm">lowercase</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyCaseTransformation((text) => text.toUpperCase())}
              >
                <span className="text-sm">UPPERCASE</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyCaseTransformation(toCapitalizedCase)}
              >
                <span className="text-sm">Capitalized Case</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Divider */}
          <div className="w-px h-6 bg-border mx-1" />

          {/* Undo Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleUndo}
                disabled={history.length === 0}
                className="h-8 px-2 hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
              >
                <Undo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Undo last formatting</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Helper Text - moved into toolbar */}
        <span className="ml-auto text-xs text-muted-foreground hidden sm:block">
          Select text to format
        </span>
      </div>
    </div>
  );
}
