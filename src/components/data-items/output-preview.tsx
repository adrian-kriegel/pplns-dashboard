
import { DataItem, DataItemQuery } from '@pplns/schemas';

import { get, GetResponse } from 'api';
import Table from '@unologin/react-ui/data/table';

export type OutputPreviewProps = 
{
  query: DataItemQuery
};

/**
 * @param param0 props
 * @returns preview for node outputs
 */
export default function OutputPreview(
  { query } : OutputPreviewProps,
)
{
  const columns : (keyof DataItem)[] = [
    'createdAt',
    'done',
    'outputChannel',
  ];

  return <Table<DataItem, never>
    initialPageSize={5}
    columns={columns.map((key) => ({ key, label: key }))}
    fetchData={(q) => get<GetResponse<DataItem>>(
      '/outputs',
      { ...q, ...query },
    )}
  />;
} 
