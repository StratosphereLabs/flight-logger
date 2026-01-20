import { useNavigate, useSearch } from '@tanstack/react-router';
import _ from 'lodash';
import { useEffect, useRef } from 'react';
import {
  type DefaultValues,
  type FieldPath,
  type FieldValues,
  type UseFormProps,
  type UseFormReturn,
  useForm,
  useWatch,
} from 'react-hook-form';

import { type AppRouter } from '../../appRouter';

export type SearchParamValues<FormValues extends FieldValues> = Partial<
  Record<keyof FormValues, string | null>
>;

export interface UseFormWithSearchParamsOptions<
  FormValues extends FieldValues = FieldValues,
  FieldNames extends ReadonlyArray<FieldPath<FormValues>> = ReadonlyArray<
    FieldPath<FormValues>
  >,
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  FormContext = any,
  TransformedValues extends FieldValues = FormValues,
> extends Omit<
  UseFormProps<FormValues, FormContext, TransformedValues>,
  'defaultValues'
> {
  defaultValues: DefaultValues<FormValues> | undefined;
  from: Parameters<typeof useSearch<AppRouter>>[0]['from'] &
    Parameters<typeof useNavigate<AppRouter>>[0];
  includeKeys: readonly [...FieldNames];
}

export const useFormWithSearchParams = <
  FormValues extends FieldValues = FieldValues,
  FieldNames extends ReadonlyArray<FieldPath<FormValues>> = ReadonlyArray<
    FieldPath<FormValues>
  >,
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  FormContext = any,
  TransformedValues extends FieldValues = FormValues,
>({
  defaultValues,
  includeKeys,
  from,
  ...useFormOptions
}: UseFormWithSearchParamsOptions<
  FormValues,
  FieldNames,
  FormContext,
  TransformedValues
>): UseFormReturn<FormValues, FormContext, TransformedValues> => {
  const search = useSearch({ from });
  const navigate = useNavigate(from);
  const methods = useForm<FormValues, FormContext, TransformedValues>({
    ...useFormOptions,
    defaultValues: {
      ...defaultValues,
      ...(search as DefaultValues<FormValues>),
    },
  });
  const formValues = useWatch({
    control: methods.control,
    name: includeKeys,
  });
  const prevFormValuesRef = useRef(formValues);
  useEffect(() => {
    const prevFormValues = prevFormValuesRef.current;
    if (_.isEqual(prevFormValues, formValues)) {
      return;
    }
    prevFormValuesRef.current = formValues;
    void navigate({
      to: from,
      search: ((prev: Record<string, unknown>) => ({
        ...prev,
        ...formValues,
      })) as Parameters<ReturnType<typeof useNavigate<AppRouter>>>[0]['search'],
    });
  }, [formValues, from, navigate]);
  return methods;
};
