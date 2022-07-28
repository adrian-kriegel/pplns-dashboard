
import { useState } from 'react';

let lastId = 0;

/**
 * @returns [key, refresh]
 */
export default function useRefresh() : [string, () => void]
{
  const [key, setKey] = useState(`refresh-key-${lastId++}`);

  return [
    key,
    () => setKey(`refresh-key-${lastId++}`),
  ];
}
