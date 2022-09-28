
// eslint-disable-next-line no-redeclare
import type { Worker } from '@pplns/schemas';
import { MenuItem, SubMenu } from '@szhsin/react-menu';
import LoadingAnimation from '@unologin/react-ui/info/loading';
import { get, GetResponse, put, resource } from 'api';
import { ChangeEvent, useEffect, useState } from 'react';
import { usePipeline } from '../task-details';

const internalNodes = 
[
  'split', 
  'join',
  'data-source',
  'data-sink',
];

/**
 * 
 * @param param0 props
 * @returns SubMenu for adding nodes of the specified workers
 */
function AddNodesMenu(
  { workerIds, title } : { workerIds: string[], title: string }
)
{
  const { createNode } = usePipeline();

  return <SubMenu label={title}>
    {
      workerIds.map((id) => 
        <MenuItem 
          key={id}
          onClick={
            () => createNode(
              {
                workerId: id,
                // TODO: position the node at the mouse position
                position: { x: 0, y: 0 },
              }
            )
          }
        >
          {id}
        </MenuItem>
      )
    }
  </SubMenu>;
}

/**
 * @returns submenu with imported nodes
 */
function ImportedNodesMenu()
{
  const [workers, setWorkers] = useState<Worker[]>();

  useEffect(
    () => 
    {
      if (!workers)
      {
        get<Worker[]>('/find-workers').then(setWorkers);
      }
    }
  );

  return <AddNodesMenu 
    title='Server file system'
    workerIds={workers?.map(({_id}) => _id) || []}
  />;
}

/**
 * @returns submenu for workers stored in the database
 */
function DatabaseWorkersMenu()
{
  const [workers, setWorkers] = useState<Worker[]>();

  useEffect(
    () => 
    {
      if (!workers)
      {
        get<GetResponse<Worker>>('/workers').then(
          // [!] TODO: respect pagination and limits
          ({ results }) => setWorkers(results)
        );
      }
    }
  );

  return <AddNodesMenu 
    title='Database'
    workerIds={workers?.map(({_id}) => _id) || []}
  />;
}

/**
 * @returns menu item for uploading new workers from file
 * 
 * TODO: error handling
 */
function UploadWorkerMenu()
{
  const [loading, setLoading] = useState(false);

  const onFileChanged = (e : ChangeEvent<HTMLInputElement>) => 
  {
    const file = e.target.files?.[0];

    if (file)
    {
      setLoading(true);

      const reader = new FileReader();

      reader.onload = async (e) => 
      {
        try 
        {
          const fileText = e.target?.result?.toString();

          if (fileText)
          {
            const worker = JSON.parse(fileText);

            await put(
              resource('/workers/:_id', { _id: worker._id }),
              worker
            );
          }
        }
        finally 
        {
          setLoading(false);
        }
      };

      reader.readAsText(file);
    }
  };

  return <MenuItem>
    {
      loading ?
        <LoadingAnimation /> :
        <label htmlFor='upload-worker-input'>
          Upload JSON file
        </label>
    }
    <input
      type='file'
      id='upload-worker-input'
      accept='text/*.json'
      style={{display: 'none'}}
      onChange={onFileChanged}
    />
  </MenuItem>;
}

/**
 * 
 * @returns task context menu
 */
export default function TaskContextMenu()
{
  return <>
    <AddNodesMenu
      title='Generic workers'
      workerIds={internalNodes}
    />
    <ImportedNodesMenu />
    <DatabaseWorkersMenu />
    <UploadWorkerMenu />
  </>;
}
