"use client";

import type { Card as CardType, Column as ColumnType } from "@/lib/types";
import { Card } from "@/components/card/Card";
import { useState } from "react";

interface ColumnProps {
  column: ColumnType;
  cards: CardType[];
  onAddCard: (columnId: string, title: string) => void;
  onUpdateCard: (id: string, title: string) => void;
  onDeleteCard: (id: string) => void;
  onUpdateColumnTitle: (id: string, title: string) => void;
  onDeleteColumn: (id: string) => void;
  onMoveCard: (cardId: string, toColumnId: string, afterCardId?: string) => void;
  draggedCard: CardType | null;
  onDragStart: (e: React.DragEvent, card: CardType) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetCard: CardType) => void;
  onDropOnColumn: (e: React.DragEvent, columnId: string) => void;
}

export function Column({
  column,
  cards,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  onUpdateColumnTitle,
  onDeleteColumn,
  onMoveCard,
  draggedCard,
  onDragStart,
  onDragOver,
  onDrop,
  onDropOnColumn,
}: ColumnProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [columnTitle, setColumnTitle] = useState(column.title);

  const sortedCards = [...cards].sort((a, b) => a.order - b.order);

  const handleAddCard = () => {
    const trimmed = newCardTitle.trim();
    if (trimmed) {
      onAddCard(column.id, trimmed);
      setNewCardTitle("");
      setIsAdding(false);
    }
  };

  const handleSaveColumnTitle = () => {
    const trimmed = columnTitle.trim();
    if (trimmed && trimmed !== column.title) {
      onUpdateColumnTitle(column.id, trimmed);
    } else {
      setColumnTitle(column.title);
    }
    setIsEditingTitle(false);
  };

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-xl border border-zinc-200 bg-zinc-50/50 dark:border-zinc-700 dark:bg-zinc-900/50">
      <div className="flex items-center justify-between gap-2 border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
        {isEditingTitle ? (
          <input
            type="text"
            value={columnTitle}
            onChange={(e) => setColumnTitle(e.target.value)}
            onBlur={handleSaveColumnTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveColumnTitle();
              if (e.key === "Escape") {
                setColumnTitle(column.title);
                setIsEditingTitle(false);
              }
            }}
            className="flex-1 rounded border border-zinc-300 px-2 py-1 text-sm font-medium dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        ) : (
          <h2
            className="flex-1 cursor-pointer font-medium text-zinc-800 dark:text-zinc-200 truncate"
            onDoubleClick={() => setIsEditingTitle(true)}
          >
            {column.title}
          </h2>
        )}
        <button
          type="button"
          onClick={() => onDeleteColumn(column.id)}
          className="rounded p-1 text-zinc-400 hover:bg-zinc-200 hover:text-red-500 dark:hover:bg-zinc-700 transition-colors"
          aria-label="Delete column"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
        </button>
      </div>

      <div
        className="flex min-h-[120px] flex-1 flex-col gap-3 overflow-y-auto p-4"
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.classList.add("bg-blue-500/5", "rounded-lg");
        }}
        onDragLeave={(e) => {
          e.currentTarget.classList.remove("bg-blue-500/5", "rounded-lg");
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove("bg-blue-500/5", "rounded-lg");
          onDropOnColumn(e, column.id);
        }}
      >
        {sortedCards.map((card) => (
          <Card
            key={card.id}
            card={card}
            onUpdate={onUpdateCard}
            onDelete={onDeleteCard}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            isDragging={draggedCard?.id === card.id}
          />
        ))}

        {isAdding ? (
          <div className="rounded-lg border border-zinc-200 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900">
            <input
              type="text"
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              onBlur={handleAddCard}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddCard();
                if (e.key === "Escape") {
                  setNewCardTitle("");
                  setIsAdding(false);
                }
              }}
              placeholder="Task title..."
              className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="flex w-full items-center gap-2 rounded-lg border border-dashed border-zinc-300 py-2.5 text-sm text-zinc-500 transition-colors hover:border-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:border-zinc-600 dark:hover:border-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
            Add task
          </button>
        )}
      </div>
    </div>
  );
}
