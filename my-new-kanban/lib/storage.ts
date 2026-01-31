// lib/storage.ts
import { supabase } from "../supabase";
import type { Board, Column, Card } from "./types";

// Board verilerini yükle
export async function loadBoard(): Promise<Board | null> {
  try {
    const [columnsResult, cardsResult] = await Promise.all([
      supabase.from("columns").select("*").order("order"),
      supabase.from("cards").select("*").order("order"),
    ]);

    if (columnsResult.error || cardsResult.error) {
      console.error("Load error:", columnsResult.error || cardsResult.error);
      return null;
    }

    // Supabase'den gelen column_id'yi columnId'ye dönüştür
    const cards: Card[] = cardsResult.data.map((card) => ({
      id: card.id,
      title: card.title,
      columnId: card.column_id,
      order: card.order,
    }));

    return {
      columns: columnsResult.data as Column[],
      cards,
    };
  } catch {
    return null;
  }
}



// Yeni column ekle
export async function addColumn(column: Column): Promise<boolean> {
  const { error } = await supabase.from("columns").insert({
    id: column.id,
    title: column.title,
    order: column.order,
  });
  if (error) {
    console.error("Add column error:", error.message, error.details, error.hint);
  }
  return !error;
}

// Yeni card ekle
export async function addCard(card: Card): Promise<boolean> {
  const { error } = await supabase.from("cards").insert({
    id: card.id,
    title: card.title,
    column_id: card.columnId,
    order: card.order,
  });
  if (error) {
    console.error("Add card error:", error.message, error.details, error.hint);
  }
  return !error;
}

// Card güncelle
export async function updateCard(card: Card): Promise<boolean> {
  const { error } = await supabase
    .from("cards")
    .update({
      title: card.title,
      column_id: card.columnId,
      order: card.order,
    })
    .eq("id", card.id);
  if (error) {
    console.error("Update card error:", error.message, error.details, error.hint);
  }
  return !error;
}

// Card sil
export async function deleteCard(cardId: string): Promise<boolean> {
  const { error } = await supabase.from("cards").delete().eq("id", cardId);
  if (error) {
    console.error("Delete card error:", error.message, error.details, error.hint);
  }
  return !error;
}

// Column sil
export async function deleteColumn(columnId: string): Promise<boolean> {
  const { error } = await supabase.from("columns").delete().eq("id", columnId);
  if (error) {
    console.error("Delete column error:", error.message, error.details, error.hint);
  }
  return !error;
}

// Board'un tamamını kaydet (localStorage benzeri davranış)
export async function saveBoard(board: Board): Promise<void> {
  try {
    // Önce mevcut verileri sil
    const deleteCardsResult = await supabase.from("cards").delete().neq("id", "");
    if (deleteCardsResult.error) {
      console.error("Delete cards error:", deleteCardsResult.error.message, deleteCardsResult.error.hint);
    }
    
    const deleteColumnsResult = await supabase.from("columns").delete().neq("id", "");
    if (deleteColumnsResult.error) {
      console.error("Delete columns error:", deleteColumnsResult.error.message, deleteColumnsResult.error.hint);
    }

    // Sonra yeni verileri ekle
    if (board.columns.length > 0) {
      const columnsResult = await supabase.from("columns").insert(board.columns);
      if (columnsResult.error) {
        console.error("Insert columns error:", columnsResult.error.message, columnsResult.error.hint);
      }
    }

    if (board.cards.length > 0) {
      const cardsForDb = board.cards.map((card) => ({
        id: card.id,
        title: card.title,
        column_id: card.columnId,
        order: card.order,
      }));
      const cardsResult = await supabase.from("cards").insert(cardsForDb);
      if (cardsResult.error) {
        console.error("Insert cards error:", cardsResult.error.message, cardsResult.error.hint);
      }
    }
  } catch (error) {
    console.error("Save board error:", error);
  }
}