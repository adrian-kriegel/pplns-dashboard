
import {
  RefObject, 
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  ControlledMenu,
} from '@szhsin/react-menu';

import '@szhsin/react-menu/dist/index.css';

import './context-menu.scss';

export type ContextMenuProps = 
{
  container: RefObject<HTMLDivElement | undefined>;
  render: (e : MouseEvent) => JSX.Element | null | string;
}

/**
 * 
 * @param param0 props
 * @returns ContextMenu 
 */
export function ContextMenu(
  { render, container } : ContextMenuProps
)
{
  // event responsible for opening the menu
  const [event, setEvent] = useState<MouseEvent | null>();

  const [pos, setPos] = useState<{ x: number, y: number }>(
    { x: -1000, y: -1000 }
  );

  useEffect(
    () => setPos({ x: event?.pageX || -1000, y: event?.pageY || -1000 }),
    [event],
  );

  const handleOpen = useCallback(
    (event : MouseEvent) => 
    {
      event.preventDefault();
      setEvent(event);
    },
    [],
  );

  const handleClose = useCallback(
    () => setPos({ x: -1000, y: -1000 }), 
    []
  );

  useEffect(() => 
  {
    container.current?.addEventListener('contextmenu', handleOpen);
    container.current?.addEventListener('click', handleClose);
    container.current?.addEventListener('mouseleave', handleClose);

    return () => 
    {
      container.current?.removeEventListener('contextmenu', handleOpen);
      container.current?.removeEventListener('click', handleClose);
      container.current?.removeEventListener('mouseleave', handleClose);
    };

  }, [container.current]);

  return <div
    className='context-menu'
    style={
      {
        top: `${pos?.y}px`,
        left: `${pos?.x}px`,
      }
    }
  >
    <ControlledMenu state={'open'}>
      { event && render(event) }
    </ControlledMenu>
  </div>;
}
