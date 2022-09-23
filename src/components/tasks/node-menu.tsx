
import { MenuItem } from '@szhsin/react-menu';
import { useLog } from '@unologin/react-ui/info/log-context';
import Overlay from '@unologin/react-ui/navigation/overlay';
import { useState } from 'react';
import type { NodeRead } from 'annotation-api/src/pipeline/schemas';
import NodeProps from './node-props';

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

  const { pushLog } = useLog();

  const successMsg = (msg : string) => pushLog(
    { type: 'success', msg }
  );

  return <>
    <MenuItem
      onClick={() => setPropertiesWindowOpen(true)}
    >
      Properties
    </MenuItem>
    <MenuItem
      onClick={
        () => 
        {
          navigator.clipboard.writeText(node._id);
          successMsg(`Copied "${node._id}" to clipboard.`);
        }
      }
    >
      Copy NodeId
    </MenuItem>
    {
      propertiesWindowOpen && <Overlay
        onClose={() => setPropertiesWindowOpen(false)}
      >
        <NodeProps node={node} />
      </Overlay>
    }
  </>;
}
