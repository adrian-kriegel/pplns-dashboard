
import { MenuItem } from '@szhsin/react-menu';
import { useLog } from '@unologin/react-ui/info/log-context';

import type { NodeRead } from '@pplns/schemas';
import NodeProps from './edit-node-props';
import PopupMenuItem from 'components/general/popup-menu-item';
import OutputPreview from 'components/data-items/output-preview';


/**
 * 
 * @param param0 props
 * @returns context menu for single node
 */
export default function NodeMenu(
  { node } : { node: NodeRead }
)
{
  const { pushLog } = useLog();

  const successMsg = (msg : string) => pushLog(
    { type: 'success', msg }
  );

  return <>
    <PopupMenuItem 
      label='Properties'
      popup={() => <NodeProps node={node} />}
    />
    <PopupMenuItem 
      label='Show outputs'
      popup={
        () => <OutputPreview
          query={{nodeId: node._id, taskId: node.taskId}}
        />
      }
    />
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
  </>;
}
