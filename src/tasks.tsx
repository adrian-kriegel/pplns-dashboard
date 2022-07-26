
import Table from '@unologin/react-ui/data/table';

import type { Task } from 'annotation-api/src/schemas/pipeline';
import { get, GetResponse } from './api';

/**
 * 
 * @returns task overview
 */
export default function Tasks()
{
  return <Table<Task, never> 
    columns={
      [
        {
          key: '_id',
          label: 'ID',
        },
        {
          key: 'title',
          label: 'Name',
        },
      ]
    }
    // TODO paginate
    fetchData={() => get<GetResponse<Task>>(
      '/tasks'
    )}
  />;
}
