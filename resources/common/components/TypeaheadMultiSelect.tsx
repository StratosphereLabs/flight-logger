import { Combobox } from '@headlessui/react';
import classNames from 'classnames';
import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { Input } from 'react-daisyui';
import { FieldValues, useController, useFormContext } from 'react-hook-form';
import { FormError } from './FormError';
import { FormLabel } from './FormLabel';
import { Badge } from './Badge';
import { TypeaheadDropdown } from './TypeaheadDropdown';
import { useTypeaheadInput } from '../hooks';
import { GenericDataType, TypeaheadSelectProps } from '../types';

export interface TypeaheadMultiSelectProps<
  DataItem extends GenericDataType,
  Values extends FieldValues,
> extends TypeaheadSelectProps<DataItem, Values, HTMLDivElement> {
  className?: string;
}

export const TypeaheadMultiSelect = <
  DataItem extends GenericDataType,
  Values extends FieldValues,
>({
  className,
  controllerProps,
  debounceTime,
  getItemText,
  getItemValue,
  inputRef,
  isRequired,
  labelText,
  name,
  onDebouncedChange,
  options,
}: TypeaheadMultiSelectProps<DataItem, Values>): JSX.Element => {
  const { setValue } = useFormContext();
  const {
    field,
    fieldState: { error },
  } = useController({
    ...controllerProps,
    name,
  });
  const [selectedItems, setSelectedItems] = useState<DataItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const { isLoading, query, setQuery } = useTypeaheadInput<DataItem>({
    debounceTime,
    onDebouncedChange,
    options,
  });
  useEffect(() => {
    const itemValues = selectedItems.map(getItemValue);
    setValue<string>(name, itemValues, {
      shouldValidate: true,
    });
  }, [selectedItems]);
  useEffect(() => {
    if (showDropdown) searchInputRef.current?.focus();
  }, [showDropdown]);
  return (
    <Combobox
      as="div"
      className={classNames('form-control', 'w-full', className)}
      multiple
      name={name}
      onChange={value => setSelectedItems(value)}
      value={selectedItems}
    >
      {labelText !== undefined ? (
        <Combobox.Label as={FormLabel} isRequired={isRequired}>
          {labelText}
        </Combobox.Label>
      ) : null}
      <div
        className={classNames(
          'input',
          'input-ghost',
          'input-bordered',
          'flex',
          'items-center',
          'gap-2',
          'cursor-pointer',
          'overflow-y-scroll',
        )}
        onBlur={event => {
          if (event.relatedTarget === null) setShowDropdown(false);
        }}
        onClick={() => setShowDropdown(true)}
        onKeyDown={event => {
          if (event.key === 'Enter') {
            event.preventDefault();
            setShowDropdown(true);
          }
        }}
        ref={inputRef}
        tabIndex={0}
      >
        {selectedItems.length > 0
          ? selectedItems.map((item, index) => (
              <Badge
                key={getItemValue(item)}
                onDismiss={() =>
                  setSelectedItems(items =>
                    items.filter((_, itemIndex) => index !== itemIndex),
                  )
                }
              >
                {getItemValue(item)}
              </Badge>
            ))
          : labelText}
      </div>
      <TypeaheadDropdown
        isLoading={isLoading}
        getItemText={getItemText}
        getItemValue={getItemValue}
        onClose={() => setShowDropdown(false)}
        options={options}
        show={showDropdown}
      >
        <Combobox.Input
          {...field}
          as={Input}
          onChange={({ target: { value } }) => setQuery(value)}
          onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
            if (event.key === 'Tab') setShowDropdown(false);
          }}
          placeholder="Search..."
          ref={searchInputRef}
          value={query}
        />
      </TypeaheadDropdown>
      {error?.message !== undefined ? (
        <FormError errorText={error.message} />
      ) : null}
    </Combobox>
  );
};
