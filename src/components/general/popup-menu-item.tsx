import { MenuItem } from '@szhsin/react-menu';
import Overlay from '@unologin/react-ui/navigation/overlay';
import { ComponentType, useState } from 'react';


/**
 * @returns menu item that renders a popup window when clicked
 */
export default function PopupMenuItem(
  { popup: Popup, label } : { popup: ComponentType, label: string }
)
{
  const [open, setOpen] = useState(false);

  return <>
    <MenuItem
      onClick={() => setOpen(true)}
    >
      {label}
    </MenuItem>

    {
      open && <Overlay
        onClose={() => setOpen(false)}
      >
        <Popup />
      </Overlay>
    }
  </>;
}
