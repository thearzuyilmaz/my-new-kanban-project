// lib/types.ts
export type Priority = "low" | "medium" | "high";

export interface Card {
  id: string;
  title: string;
  columnId: string;
  order: number;
  priority?: Priority;
}

export interface Column {
  id: string;
  title: string;
  order: number;
}

export interface Board {
  columns: Column[];
  cards: Card[];
}

// Supabase Database tipi (opsiyonel ama önerilir)
export interface Database {
  public: {
    Tables: {
      columns: {
        Row: Column;
        Insert: Omit<Column, 'id'> & { id?: string };
        Update: Partial<Column>;
      };
      cards: {
        Row: {
          id: string;
          title: string;
          column_id: string;
          order: number;
          priority?: Priority;
        };
        Insert: Omit<Card, 'id'> & { id?: string };
        Update: Partial<Card>;
      };
    };
  };
}