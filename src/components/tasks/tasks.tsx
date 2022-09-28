
import Table from '@unologin/react-ui/data/table';
import Button from '@unologin/react-ui/inputs/button';

import type { Task, TaskWrite } from '@pplns/schemas';
import { useHistory } from 'react-router';
import { get, GetResponse, post } from '../../api';

/**
 * 
 * @returns task overview
 */
export default function Tasks()
{
  const history = useHistory();

  const createNewTask = async () => 
  {
    const task : TaskWrite = 
    {
      title: 'new task',
      description: '',
      params: {},
      owners: [],
    };

    const [, taskId] = (await post<string>(
      '/tasks',
      task,
    )).split(' ');

    history.push('/tasks/' + taskId);
  };

  return <Table<Task, never> 
    header={<>
      <Button
        label='new task'
        onClick={createNewTask}
      />
    </>}
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
        {
          key: 'createdAt',
          label: 'Created At',
        },
      ]
    }
    // TODO paginate
    fetchData={() => get<GetResponse<Task>>(
      '/tasks'
    )}
    rowProps={({ _id }) => ({ href: `/tasks/${_id}` })}
  />;
}
