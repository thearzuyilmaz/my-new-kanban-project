"use client";

import type { Card as CardType, Priority } from "@/lib/types";
import { useState } from "react";

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bgColor: string }> = {
  low: { label: "Low", color: "text-green-600 dark:text-green-400", bgColor: "bg-green-100 dark:bg-green-900/30" },
  medium: { label: "Medium", color: "text-yellow-600 dark:text-yellow-400", bgColor: "bg-yellow-100 dark:bg-yellow-900/30" },
  high: { label: "High", color: "text-red-600 dark:text-red-400", bgColor: "bg-red-100 dark:bg-red-900/30" },
};

interface CardProps {
  card: CardType;
  onUpdate: (id: string, title: string) => void;
  onUpdatePriority: (id: string, priority: Priority) => void;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent, card: CardType) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetCard: CardType) => void;
  isDragging: boolean;
}

export function Card({
  card,
  onUpdate,
  onUpdatePriority,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
}: CardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);

  const currentPriority = card.priority || "medium";

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
        <div className="flex flex-col gap-2">
          <div
            className="flex items-start justify-between gap-2"
            onDoubleClick={() => setIsEditing(true)}
          >
            <span className="flex-1 text-sm text-zinc-800 dark:text-zinc-200">
              {card.title}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-blue-500 transition-opacity p-0.5 rounded"
                aria-label="Edit task"
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
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  <path d="m15 5 4 4" />
                </svg>
              </button>
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
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPriorityMenu(!showPriorityMenu)}
              className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium ${PRIORITY_CONFIG[currentPriority].bgColor} ${PRIORITY_CONFIG[currentPriority].color}`}
              aria-label="Change priority"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                <line x1="4" x2="4" y1="22" y2="15" />
              </svg>
              {PRIORITY_CONFIG[currentPriority].label}
            </button>
            {showPriorityMenu && (
              <div className="absolute left-0 top-full z-10 mt-1 w-28 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                {(["low", "medium", "high"] as Priority[]).map((priority) => (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => {
                      onUpdatePriority(card.id, priority);
                      setShowPriorityMenu(false);
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-700 ${
                      currentPriority === priority ? "font-medium" : ""
                    } ${PRIORITY_CONFIG[priority].color}`}
                  >
                    {currentPriority === priority && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    <span className={currentPriority === priority ? "" : "ml-5"}>
                      {PRIORITY_CONFIG[priority].label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
