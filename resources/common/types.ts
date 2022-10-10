import { AlertProps } from 'react-daisyui';

export interface AlertMessage {
  status: AlertProps['status'];
  message: string;
}

export interface ErrorResponse {
  status: number;
  message: string;
}

export interface PaginationMetadata {
  page: number;
  pageCount: number;
  limit: number;
  itemCount: number;
  pages: Array<number | null>;
}

export interface PaginatedResults<Data> {
  metadata: PaginationMetadata;
  results: Data[];
}
