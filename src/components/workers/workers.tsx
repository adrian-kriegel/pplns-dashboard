
import Table from '@unologin/react-ui/data/table';
import Button from '@unologin/react-ui/inputs/button';

import type {
  // eslint-disable-next-line
  Worker,
  WorkerWrite,
} from 'annotation-api/src/schemas/pipeline';
import useButton from '@unologin/react-ui/hooks/use-button';
import { get, GetResponse, patch, post, resource } from '../../api';

import Input from '@unologin/react-ui/inputs/input';
import TextArea from '@unologin/react-ui/inputs/text-area';
import Overlay from '@unologin/react-ui/navigation/overlay';
import { useState } from 'react';
import useRefresh from '../../hooks/use-refresh';

type WorkerDetailsProps = 
{
  worker: Worker | WorkerWrite;
  onSave: (w: Worker) => any;
}

/**
 * 
 * @param param0 props
 * @returns worker details editor
 */
function WorkerDetails(
  {
    worker,
    onSave,
  } : WorkerDetailsProps
)
{
  const [name, setName] = useState(
    worker.title,
  );

  const [description, setDescription] = useState(
    worker.description,
  );

  const btn = useButton();

  const save = async () => 
  {
    btn.setLoading(true);

    let result : Worker;

    if ('_id' in worker)
    {
      result = await patch<Worker>(
        resource(
          '/workers/:workerId',
          { workerId: worker._id }
        ),
        {
          title: name,
          description,
        }
      );
    }
    else 
    {
      result = await post<Worker>(
        '/workers',
        {
          ...worker,
          title: name,
          description,
        }
      );
    }

    btn.setLoading(false);
    btn.setDone(true);

    onSave(result);
  };

  return <>
    <Input
      label='Name'
      onChange={(e) => setName(e.target.value)}
      value={name}
      id='name'
      valid={true}
    />
    <TextArea
      value={description}
      onChange={setDescription}
    />
    <Button
      label='save'
      onClick={save}
      {...btn.state}
    />
  </>;
}


/**
 * 
 * @returns worker overview
 */
export default function Workers(
  { columns = ['title', 'createdAt'] } : { columns: (keyof Worker)[] }
)
{
  const [selectedWorker, setSelectedWorker] = useState<Worker | WorkerWrite>();

  const [details, showDetails] = useState(false);

  const [selectedIndex, setSelectedIndex] = useState<number>();

  const [tableKey, refreshTable] = useRefresh();

  const [search, setSearch] = useState('');

  return <>
    {
      selectedWorker && details && <Overlay
        onClose={() => showDetails(false)}
      >
        <WorkerDetails
          worker={selectedWorker}
          onSave={(worker) => 
          {
            setSelectedWorker(worker);
            refreshTable();
            showDetails(false);
          }}
        />
      </Overlay>
    }
    <Table<Worker, never> 
      searchQuery={search}
      onSearchQuery={setSearch}
      key={tableKey}
      onSelect={
        (selected, workers) => 
        {
          setSelectedIndex(selected[selected.length - 1]);
          setSelectedWorker(workers[workers.length - 1]);
        }
      }
      selected={selectedIndex !== undefined ? [selectedIndex] : []}
      header={<>
        <Button
          label='edit'
          onClick={() => showDetails(true)}
          disabled={details || selectedIndex === undefined}
        />
        <Button
          label='new worker'
          onClick={
            () => 
            {
              setSelectedWorker(
                {
                  title: '',
                  description: '',
                  inputs: {},
                  outputs: {},
                  params: {},
                }
              );

              showDetails(true);
            }
          }
        />
      </>}
      columns={columns.map((key) => ({ key, label: key }))}
      // TODO paginate
      fetchData={() => get<GetResponse<Worker>>(
        '/workers'
      )}
      rowProps={({ _id }) => ({ href: `/workers/${_id}` })}
    />
  </>;
}