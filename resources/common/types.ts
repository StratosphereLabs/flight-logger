import { PageElement } from 'express-paginate';
import { AlertProps } from 'react-daisyui';

export interface AlertMessage {
  status: AlertProps['status'];
  message: string;
}

export interface ErrorResponse {
  status: number;
  message: string;
}

export interface PaginationQueryOptions {
  page: number;
  limit: number;
}

export interface PaginatedResults<Data> {
  metadata: {
    page: number;
    pageCount: number;
    limit: number;
    itemCount: number;
    pages: PageElement[];
  };
  results: Data[];
}
