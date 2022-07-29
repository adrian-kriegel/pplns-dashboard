
import Button from '@unologin/react-ui/inputs/button';

import type {
  DataTypeDefinition,
  DataTypeRecord,
} from 'annotation-api/src/schemas/pipeline';

import { useEffect, useState } from 'react';

import './data-record-input.scss';

export type DataRecordInputProps = 
{
  value: DataTypeRecord;
  onChange: (r: DataTypeRecord) => any;
};

// data type definition that validates true for any inputs
const anyType : DataTypeDefinition =
{
  description: 'Any type.',
  schema: {},
};

/**
 * TODO: allow for editing the schema too
 * @param param0 props
 * @returns input element for editing data type records
 */
export default function DataRecordInput(
  { value: record, onChange } : DataRecordInputProps
)
{
  const [inputValue, setInputValue] = useState('');

  useEffect(
    () => 
    {
      setInputValue('');

    }, 
    [record]
  );

  return <div className='data-type-record-input'>
    {
      Object.entries(record).map(([key]) => 
        <div className='data-type-record-entry' key={key}>
          { key } <Button 
            label='x'
            onClick={
              () => 
              {
                const newRecord = { ...record };
                delete newRecord[key];
                onChange(newRecord);
              }
            }
          />
        </div>
      )
    }
    <input 
      placeholder='name'
      type='text'
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
    />
    <Button
      label='+'
      onClick={
        () => onChange({ ...record, [inputValue]: anyType })
      }
    />
  </div>;
}
