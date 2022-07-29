
import Table from '@unologin/react-ui/data/table';
import Button from '@unologin/react-ui/inputs/button';

import type { Task, TaskWrite } from 'annotation-api/src/schemas/pipeline';
import { useNavigate } from 'react-router';
import { get, GetResponse, post } from '../../api';

/**
 * 
 * @returns task overview
 */
export default function Tasks()
{
  const navigate = useNavigate();

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

    navigate('/tasks/' + taskId);
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
