export const createNullableDate = (dateString: string | null): Date | null =>
  dateString !== null ? new Date(dateString) : null;
