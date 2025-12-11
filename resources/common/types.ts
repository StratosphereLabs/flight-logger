import {
  type TRPCErrorShape,
  type TRPC_ERROR_CODE_KEY,
  type TRPC_ERROR_CODE_NUMBER,
} from '@trpc/server/rpc';
import { type typeToFlattenedError } from 'zod';

import { type REFETCH_INTERVALS } from './constants';

export interface ErrorResponse {
  status: number;
  message: string;
}

export type RefetchInterval = (typeof REFETCH_INTERVALS)[number];

export interface DefaultErrorData {
  [x: string]: unknown;
  code: TRPC_ERROR_CODE_KEY;
  httpStatus: number;
  path?: string;
  stack?: string;
  zodError?: typeToFlattenedError<Record<string, unknown>, string> | null;
}

export interface DefaultErrorShape
  extends TRPCErrorShape<TRPC_ERROR_CODE_NUMBER, DefaultErrorData> {
  message: string;
  code: TRPC_ERROR_CODE_NUMBER;
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

export type FlightDelayStatus = 'canceled' | 'severe' | 'moderate' | 'none';
