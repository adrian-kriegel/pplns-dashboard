
import { MenuItem } from '@szhsin/react-menu';
import Overlay from '@unologin/react-ui/navigation/overlay';
import { useState } from 'react';
import { NodeRead } from '../../../../annotation-api/src/schemas/pipeline';

/**
 * 
 * @param param0 props
 * @returns context menu for single node
 */
export default function NodeMenu(
  { node } : { node: NodeRead }
)
{
  const [propertiesWindowOpen, setPropertiesWindowOpen] = useState(false);

  return <>
    <MenuItem
      onClick={() => setPropertiesWindowOpen(true)}
    >
      Properties
    </MenuItem>
    {
      propertiesWindowOpen && <Overlay
        onClose={() => setPropertiesWindowOpen(false)}
      >
        <h1>{node.worker.title}</h1>
      </Overlay>
    }
  </>;
}
