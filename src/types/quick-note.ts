export interface QuickNoteDto {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  convertedAt: string | null;
  convertedCardId: string | null;
}

export interface ConvertQuickNoteRequest {
  boardId: string;
  listId: string;
}

export interface QuickNoteConversionDto {
  note: QuickNoteDto;
  card: { id: string; boardId: string; listId: string; cardKey: string; title: string };
}
