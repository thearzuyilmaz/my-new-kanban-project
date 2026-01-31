"use client";

import type { Card as CardType } from "@/lib/types";
import { useState } from "react";

interface CardProps {
  card: CardType;
  onUpdate: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent, card: CardType) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetCard: CardType) => void;
  isDragging: boolean;
}

export function Card({
  card,
  onUpdate,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
}: CardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(card.title);

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (trimmed && trimmed !== card.title) {
      onUpdate(card.id, trimmed);
    } else {
      setTitle(card.title);
    }
    setIsEditing(false);
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, card)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, card)}
      className={`group rounded-lg border bg-white p-3 shadow-sm transition-shadow dark:bg-zinc-900 dark:border-zinc-700 ${
        isDragging ? "opacity-50 cursor-grabbing" : "cursor-grab hover:shadow-md"
      }`}
    >
      {isEditing ? (
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
            if (e.key === "Escape") {
              setTitle(card.title);
              setIsEditing(false);
            }
          }}
          className="w-full rounded border border-zinc-300 px-2 py-1 text-sm dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
      ) : (
        <div
          className="flex items-start justify-between gap-2"
          onDoubleClick={() => setIsEditing(true)}
        >
          <span className="flex-1 text-sm text-zinc-800 dark:text-zinc-200">
            {card.title}
          </span>
          <button
            type="button"
            onClick={() => onDelete(card.id)}
            className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-opacity p-0.5 rounded"
            aria-label="Delete task"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
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
      )}
    </div>
  );
}
