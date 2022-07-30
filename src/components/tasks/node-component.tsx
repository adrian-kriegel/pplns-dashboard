
import {
  Handle,
  HandleType,
  Position,
} from 'react-flow-renderer';

import type { 
  NodeRead,
} from 'annotation-api/src/schemas/pipeline';

import './node-component.scss';
import { usePipeline } from './task-details';

export type NodeComponentProps = 
{
  data: { node: NodeRead };
}

const handleSpacing = 14;
const headerHeight = 14;

/**
 * 
 * @param param0 props
 * @returns handle element
 */
function NodeHandle(
  { label, type, index } : 
  {
    label: string;
    type: HandleType;
    index: number;
  }
)
{
  const isInput = type === 'target';

  return <Handle
    id={label}
    type={type}
    position={isInput ? Position.Left : Position.Right}
    className={
      'node-handle ' + (isInput ? 'node-handle-input' : 'node-handle-output')
    }
    style={{top: ((index + 1) * handleSpacing + headerHeight) + 'px'}}
  >
    <div className='node-handle-label'>
      {label}
    </div>
  </Handle>;
}

/**
 * 
 * @param param0 props
 * @returns node element
 */
export default function NodeComponent(
  { data: { node } } : NodeComponentProps,
) 
{
  const { onNodeChanged } = usePipeline();

  const inputs = node.worker.inputs;
  const outputs = node.worker.outputs;

  const height = (Math.max(
    Object.entries(inputs).length,
    Object.entries(outputs).length
  ) + 1) * handleSpacing + headerHeight + 'px';

  return <div 
    className='flow-node'
    style={{height}}
  >
    <div className='flow-node-header' style={{height: headerHeight}}>
      {node.worker.title}
      
      <div
        className='flow-node-button'
        onClick={() => onNodeChanged(node._id, 'delete', true)}
      >
        x
      </div>
    </div>
    {
      Object.entries(inputs).map(
        ([key], index) => <NodeHandle 
          label={key} 
          key={key}
          type='target'
          index={index}
        />
      )
    }
    {
      Object.entries(outputs).map(
        ([key], index) => <NodeHandle 
          label={key} 
          key={key}
          type='source'
          index={index}
        />
      )
    }
  </div>;
}
