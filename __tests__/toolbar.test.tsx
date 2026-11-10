/**
 * Unit tests for the Toolbar component.
 * Verifies that toolbar buttons are rendered and have correct labels/titles.
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Toolbar from "@/components/Toolbar";
import type { Editor } from "@tiptap/react";

// Minimal mock of a TipTap editor instance
function makeMockEditor(overrides: Partial<ReturnType<typeof buildMockEditor>> = {}) {
  return buildMockEditor(overrides);
}

function buildMockEditor(overrides: Record<string, unknown> = {}) {
  const isActive = jest.fn().mockReturnValue(false);
  const canChain = {
    focus: () => canChain,
    toggleBold: () => canChain,
    toggleItalic: () => canChain,
    toggleUnderline: () => canChain,
    toggleHeading: () => canChain,
    toggleBulletList: () => canChain,
    toggleOrderedList: () => canChain,
    undo: () => canChain,
    redo: () => canChain,
    run: jest.fn(),
  };
  const canResult = {
    undo: jest.fn().mockReturnValue(true),
    redo: jest.fn().mockReturnValue(true),
  };

  return {
    isActive,
    chain: () => canChain,
    can: () => canResult,
    ...overrides,
  } as unknown as Editor;
}

describe("Toolbar rendering", () => {
  test("renders the toolbar container", () => {
    const editor = makeMockEditor();
    render(<Toolbar editor={editor} />);
    expect(screen.getByTestId("toolbar")).toBeInTheDocument();
  });

  test("renders Bold button", () => {
    render(<Toolbar editor={makeMockEditor()} />);
    expect(screen.getByTitle(/Bold/i)).toBeInTheDocument();
  });

  test("renders Italic button", () => {
    render(<Toolbar editor={makeMockEditor()} />);
    expect(screen.getByTitle(/Italic/i)).toBeInTheDocument();
  });

  test("renders Underline button", () => {
    render(<Toolbar editor={makeMockEditor()} />);
    expect(screen.getByTitle(/Underline/i)).toBeInTheDocument();
  });

  test("renders Heading 1, 2, 3 buttons", () => {
    render(<Toolbar editor={makeMockEditor()} />);
    expect(screen.getByTitle("Heading 1")).toBeInTheDocument();
    expect(screen.getByTitle("Heading 2")).toBeInTheDocument();
    expect(screen.getByTitle("Heading 3")).toBeInTheDocument();
  });

  test("renders Bullet List and Numbered List buttons", () => {
    render(<Toolbar editor={makeMockEditor()} />);
    expect(screen.getByTitle("Bullet List")).toBeInTheDocument();
    expect(screen.getByTitle("Numbered List")).toBeInTheDocument();
  });

  test("renders nothing when editor is null", () => {
    const { container } = render(<Toolbar editor={null} />);
    expect(container.firstChild).toBeNull();
  });

  test("Bold button has active class when bold is active", () => {
    const editor = makeMockEditor({
      isActive: (name: unknown) => name === "bold",
    }) as unknown as Editor;
    render(<Toolbar editor={editor} />);
    const boldBtn = screen.getByTitle(/Bold/i);
    expect(boldBtn).toHaveClass("bg-blue-100");
  });
});
