
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

import DataRecordInput from '../inputs/data-record-input';

type WorkerDetailsProps = 
{
  worker: Worker | WorkerWrite;
  onSave: (w: Worker) => any;
}

export type WorkersProps = 
{
  columns?: (keyof Worker)[];
  onClick?: (w: Worker) => any;
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

  const [inputs, setInputs] = useState(worker.inputs);
  const [outputs, setOutputs] = useState(worker.outputs);

  const btn = useButton();

  const save = async () => 
  {
    btn.setLoading(true);

    let result : Worker;


    const changes = 
    {
      title: name,
      description,
      inputs,
      outputs,
    };

    if ('_id' in worker)
    {
      result = await patch<Worker>(
        resource(
          '/workers/:workerId',
          { workerId: worker._id }
        ),
        changes
      );
    }
    else 
    {
      result = await post<Worker>(
        '/workers',
        {
          ...worker,
          ...changes,
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
    <h3>
      Inputs
    </h3>
    <DataRecordInput
      value={inputs}
      onChange={setInputs}
    />
    <h3>
      Outputs
    </h3>
    <DataRecordInput
      value={outputs}
      onChange={setOutputs}
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
  {
    columns = ['title', 'createdAt'],
    onClick,
  } : WorkersProps
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
      rowProps={
        (worker) => onClick ? 
          { onClick: () => onClick(worker) } :
          { href: `/workers/${worker._id}` }
      }
    />
  </>;
}
