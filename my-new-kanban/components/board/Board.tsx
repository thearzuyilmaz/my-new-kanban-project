"use client";

import type { Board as BoardType, Card as CardType, Column as ColumnType } from "@/lib/types";
import { loadBoard, saveBoard } from "@/lib/storage";
import { generateId } from "@/lib/utils";
import { Column } from "@/components/column/Column";
import { useState, useEffect, useCallback } from "react";

const DEFAULT_BOARD: BoardType = {
  columns: [
    { id: "col-1", title: "To Do", order: 0 },
    { id: "col-2", title: "In Progress", order: 1 },
    { id: "col-3", title: "Done", order: 2 },
  ],
  cards: [],
};

export function Board() {
  const [board, setBoard] = useState<BoardType>(DEFAULT_BOARD);
  const [draggedCard, setDraggedCard] = useState<CardType | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const saved = await loadBoard();
      if (saved && saved.columns.length > 0) {
        setBoard(saved);
      }
    };
    loadData();
  }, []);

const persist = useCallback((next: BoardType) => {
  setBoard(next);
  saveBoard(next).catch(err => console.error("Persist error:", err));
}, []);

  const addColumn = () => {
    const newColumn: ColumnType = {
      id: `col-${generateId()}`,
      title: "New Column",
      order: board.columns.length,
    };
    persist({
      ...board,
      columns: [...board.columns, newColumn],
    });
  };

  const updateColumnTitle = (id: string, title: string) => {
    persist({
      ...board,
      columns: board.columns.map((c) =>
        c.id === id ? { ...c, title } : c
      ),
    });
  };

  const deleteColumn = (id: string) => {
    persist({
      columns: board.columns.filter((c) => c.id !== id),
      cards: board.cards.filter((c) => c.columnId !== id),
    });
  };

  const addCard = (columnId: string, title: string) => {
    const columnCards = board.cards.filter((c) => c.columnId === columnId);
    const maxOrder = columnCards.length
      ? Math.max(...columnCards.map((c) => c.order))
      : -1;
    const newCard: CardType = {
      id: `card-${generateId()}`,
      title,
      columnId,
      order: maxOrder + 1,
    };
    persist({
      ...board,
      cards: [...board.cards, newCard],
    });
  };

  const updateCard = (id: string, title: string) => {
    persist({
      ...board,
      cards: board.cards.map((c) => (c.id === id ? { ...c, title } : c)),
    });
  };

  const deleteCard = (id: string) => {
    persist({
      ...board,
      cards: board.cards.filter((c) => c.id !== id),
    });
  };

  const moveCard = (cardId: string, toColumnId: string, afterCardId?: string) => {
    const card = board.cards.find((c) => c.id === cardId);
    if (!card || card.columnId === toColumnId) return;

    const targetCards = board.cards
      .filter((c) => c.columnId === toColumnId && c.id !== cardId)
      .sort((a, b) => a.order - b.order);

    let insertAt: number;
    if (afterCardId) {
      const idx = targetCards.findIndex((c) => c.id === afterCardId);
      insertAt = idx >= 0 ? idx + 1 : targetCards.length;
    } else {
      insertAt = targetCards.length; // append when dropping on empty column area
    }

    const moved = { ...card, columnId: toColumnId, order: insertAt };
    const newTargetCards = [...targetCards.slice(0, insertAt), moved, ...targetCards.slice(insertAt)]
      .map((c, i) => ({ ...c, order: i }));

    const sourceCards = board.cards
      .filter((c) => c.columnId === card.columnId && c.id !== cardId)
      .sort((a, b) => a.order - b.order)
      .map((c, i) => ({ ...c, order: i }));

    const otherColumnsCards = board.cards.filter(
      (c) => c.columnId !== toColumnId && c.columnId !== card.columnId
    );

    persist({
      ...board,
      cards: [...otherColumnsCards, ...sourceCards, ...newTargetCards],
    });
  };

  const handleDragStart = (e: React.DragEvent, card: CardType) => {
    setDraggedCard(card);
    e.dataTransfer.setData("text/plain", card.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetCard: CardType) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData("text/plain");
    if (cardId && cardId !== targetCard.id) {
      moveCard(cardId, targetCard.columnId, targetCard.id);
    }
    setDraggedCard(null);
  };

  const handleDropOnColumn = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData("text/plain");
    if (cardId) {
      moveCard(cardId, columnId);
    }
    setDraggedCard(null);
  };

  const sortedColumns = [...board.columns].sort((a, b) => a.order - b.order);

  return (
    <div className="flex h-full flex-col p-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-100">
          Kanban Board
        </h1>
        <button
          type="button"
          onClick={addColumn}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
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
          Add column
        </button>
      </header>

      <div className="flex flex-1 gap-6 overflow-x-auto pb-4">
        {sortedColumns.map((column) => (
          <Column
            key={column.id}
            column={column}
            cards={board.cards.filter((c) => c.columnId === column.id)}
            onAddCard={addCard}
            onUpdateCard={updateCard}
            onDeleteCard={deleteCard}
            onUpdateColumnTitle={updateColumnTitle}
            onDeleteColumn={deleteColumn}
            onMoveCard={moveCard}
            draggedCard={draggedCard}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDropOnColumn={handleDropOnColumn}
          />
        ))}
      </div>
    </div>
  );
}
