
import { useEffect, useState } from 'react';

type Interval = ReturnType<typeof setInterval>;

/**
 * @returns void
 */
export default function useInterval(
  ...[fnc, ms, deps] : [...Parameters<typeof setInterval>, any[]?]
)
{
  const [handle, setHandle] = useState<Interval>();
  
  useEffect(
    () => 
    {
      if (handle !== undefined)
      {
        clearInterval(handle);
      }
      
      fnc();
      setHandle(
        setInterval(fnc, ms)
      );

      return () => 
      {
        if (handle !== undefined)
        {
          clearInterval(handle);
        }
      };
    },
    deps || []
  );
}
