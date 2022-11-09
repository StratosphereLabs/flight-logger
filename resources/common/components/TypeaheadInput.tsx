import { Combobox } from '@headlessui/react';
import classNames from 'classnames';
import { Input, InputProps } from 'react-daisyui';
import { useTypeaheadInput, UseTypeaheadInputOptions } from '../hooks';
import { GenericDataType } from '../types';
import { FormLabel } from './FormLabel';

export interface TypeaheadInputProps<DataItem>
  extends UseTypeaheadInputOptions,
    InputProps {
  isRequired?: boolean;
  getItemText: (data: DataItem) => string;
  labelText?: string;
  options?: DataItem[];
}

export const TypeaheadInput = <DataItem extends GenericDataType>({
  debounceTime,
  getItemText,
  isFetching,
  isRequired,
  labelText,
  onDebouncedChange,
  options,
  ...props
}: TypeaheadInputProps<DataItem>): JSX.Element => {
  const { isLoading, selectedItem, setQuery, setSelectedItem } =
    useTypeaheadInput<DataItem>({
      debounceTime,
      isFetching,
      onDebouncedChange,
    });
  return (
    <Combobox
      as="div"
      className="form-control w-full max-w-sm"
      onChange={setSelectedItem}
      value={selectedItem}
    >
      {labelText !== undefined ? (
        <Combobox.Label as={FormLabel} isRequired={isRequired}>
          {labelText}
        </Combobox.Label>
      ) : null}
      <Combobox.Input
        as={Input}
        displayValue={(item: DataItem | null) =>
          item !== null ? getItemText(item) : ''
        }
        onChange={({ target: { value } }) => setQuery(value)}
        {...props}
      />
      <div className="relative">
        <div className="absolute min-w-[200px] z-10 mt-[1px] w-full">
          <Combobox.Options className="menu rounded-lg bg-base-300">
            {isLoading ? (
              <Combobox.Option className="disabled" value={null}>
                <p>Loading...</p>
              </Combobox.Option>
            ) : null}
            {!isLoading && options?.length === 0 ? (
              <Combobox.Option className="disabled" value={null}>
                <p>No Results</p>
              </Combobox.Option>
            ) : null}
            {!isLoading &&
              options?.map(option => (
                <Combobox.Option
                  className={({ active, disabled }) =>
                    classNames(
                      active ? 'bg-primary' : 'bg-ghost',
                      disabled && 'disabled',
                    )
                  }
                  key={option.id}
                  value={option}
                >
                  <p>{getItemText(option)}</p>
                </Combobox.Option>
              ))}
          </Combobox.Options>
        </div>
      </div>
    </Combobox>
  );
};
