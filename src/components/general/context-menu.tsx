
import {
  PropsWithChildren, 
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
}

export const mousePos = 
{
  x: 0,
  y: 0,
};

/**
 * 
 * @param param0 props
 * @returns ContextMenu 
 */
export function ContextMenu(
  { children, container } : PropsWithChildren<ContextMenuProps>
)
{
  const [pos, setPos] = useState<{ x: number, y: number}>();

  const [visible, setVisible] = useState(false);

  const handleOpen = useCallback(
    (event : MouseEvent) => 
    {
      event.preventDefault();
      setPos({ x: event.pageX, y: event.pageY });
      mousePos.x = event.pageX;
      mousePos.y = event.pageY;
      setVisible(true);
    },
    [],
  );

  const handleClose = useCallback(
    () => setVisible(false), 
    []
  );

  useEffect(() => 
  {
    container.current?.addEventListener('contextmenu', handleOpen);
    container.current?.addEventListener('click', handleClose);

    return () => 
    {
      container.current?.removeEventListener('contextmenu', handleOpen);
      container.current?.removeEventListener('click', handleClose);
    };

  }, [container.current]);

  return <div
    className='context-menu'
    style={
      {
        top: `${pos?.y || 0}px`,
        left: `${pos?.x || 0}px`,
        display: visible ? undefined : 'none',
      }
    }
  >
    <ControlledMenu state={visible ? 'open' : 'closed'}>
      { children }
    </ControlledMenu>
  </div>;
}
