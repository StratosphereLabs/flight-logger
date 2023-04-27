import { FileInput } from 'react-daisyui';
import { FieldValues, Path, useController } from 'react-hook-form';

export interface FormFileUploadProps<Values extends FieldValues> {
  name: Path<Values>;
}

export const FormFileUpload = <Values extends FieldValues>({
  name,
}: FormFileUploadProps<Values>): JSX.Element => {
  const { field } = useController({
    name,
  });
  return <FileInput {...field} />;
};
