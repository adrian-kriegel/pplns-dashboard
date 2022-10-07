
import { useCallback, useState } from 'react';

import type {
  BackgroundWorkerStatus,
} from '@pplns/core-api/src/background-worker/background-worker-status';
import useInterval from 'hooks/use-interval';
import { get } from 'api';

export type StatusIndicatorProps = 
{
  taskId: string;
}

const pad = (s: any) => String(s).padStart(2, '0');

/**
 * @returns status indicator for a task view
 */
export default function StatusIndicator(
  {
    taskId,
  } : StatusIndicatorProps
)
{
  const [workerStatus, setWorkerStatus] = useState<BackgroundWorkerStatus>();

  const refreshWorkerStatus = useCallback(
    () => 
    {
      get<BackgroundWorkerStatus>('/status')
        .then((status) => 
        {
          setWorkerStatus(status);
        });
    },
    []
  );

  useInterval(
    refreshWorkerStatus,
    30000,
    [taskId]
  );

  const [diff, setDiff] = useState<number>(NaN);

  const tickTimer = useCallback(
    () => 
    {
      if (workerStatus)
      {
        workerStatus?.lastExec && setDiff(
          Date.now() - new Date(workerStatus.lastExec).getTime()
        );
      }
    },
    [workerStatus]
  );

  useInterval(
    tickTimer,
    10000,
    [workerStatus]
  );

  const secs = diff / 1000;
  const mins = secs / 60;
  const hours = mins / 60;
  const days = hours / 24;

  return <div className='task-status-indicator'>
    <span>Worker lag: </span>
    {Math.floor(days)}d {pad(Math.floor(hours) % 24)}:{
      pad(Math.floor(mins) % 60)
    }:{pad(Math.floor(secs) % 60)}
  </div>;
}
