
// eslint-disable-next-line no-redeclare
import type { Worker } from '@pplns/schemas';
import { MenuItem, SubMenu } from '@szhsin/react-menu';
import { get } from 'api';
import { useEffect, useState } from 'react';
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
    title='File system'
    workerIds={workers?.map(({_id}) => _id) || []}
  />;
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
  </>;
}
