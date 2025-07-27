"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Link,
  Undo,
  Redo,
} from "lucide-react"

interface EditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function Editor({ value, onChange, placeholder = "Start typing..." }: EditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value || ""
    }
  }, [value])

  // Handle content changes
  const handleContentChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  // Format commands
  const formatDoc = (command: string, value = "") => {
    document.execCommand(command, false, value)
    handleContentChange()
    if (editorRef.current) {
      editorRef.current.focus()
    }
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="bg-muted p-2 border-b flex flex-wrap gap-1">
        <Button variant="ghost" size="icon" type="button" onClick={() => formatDoc("bold")} className="h-8 w-8">
          <Bold className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" type="button" onClick={() => formatDoc("italic")} className="h-8 w-8">
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => formatDoc("insertUnorderedList")}
          className="h-8 w-8"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => formatDoc("insertOrderedList")}
          className="h-8 w-8"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="h-6 w-px bg-border mx-1" />
        <Button variant="ghost" size="icon" type="button" onClick={() => formatDoc("justifyLeft")} className="h-8 w-8">
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => formatDoc("justifyCenter")}
          className="h-8 w-8"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" type="button" onClick={() => formatDoc("justifyRight")} className="h-8 w-8">
          <AlignRight className="h-4 w-4" />
        </Button>
        <div className="h-6 w-px bg-border mx-1" />
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => formatDoc("formatBlock", "<h1>")}
          className="h-8 w-8"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => formatDoc("formatBlock", "<h2>")}
          className="h-8 w-8"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <div className="h-6 w-px bg-border mx-1" />
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => {
            const url = prompt("Enter URL:")
            if (url) formatDoc("createLink", url)
          }}
          className="h-8 w-8"
        >
          <Link className="h-4 w-4" />
        </Button>
        <div className="ml-auto flex gap-1">
          <Button variant="ghost" size="icon" type="button" onClick={() => formatDoc("undo")} className="h-8 w-8">
            <Undo className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" type="button" onClick={() => formatDoc("redo")} className="h-8 w-8">
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[200px] p-4 focus:outline-none"
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false)
          handleContentChange()
        }}
        onInput={handleContentChange}
        data-placeholder={placeholder}
        style={{
          minHeight: "200px",
        }}
      />
    </div>
  )
}
