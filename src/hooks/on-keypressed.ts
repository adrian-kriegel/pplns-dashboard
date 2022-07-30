
import { useEffect } from 'react';
import { KeyCode, useKeyPress } from 'react-flow-renderer';

/**
 * @returns void
 * @param key key
 * @param callback callback
 */
export default function onKeyPressed(
  key : KeyCode,
  callback : () => any  
)
{
  const keyPressed = useKeyPress(key);

  useEffect(() => { keyPressed && callback(); }, [keyPressed]);
}
