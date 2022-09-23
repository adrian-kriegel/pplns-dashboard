
import {
  Handle,
  HandleType,
  Position,
} from 'react-flow-renderer';

import type { 
  NodeRead,
} from 'annotation-api/src/pipeline/schemas';

import { usePipeline } from './task-details';

import { useRef } from 'react';

import './node-component.scss';

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
    style={
      {
        top: ((index + 1) * handleSpacing + headerHeight) + 'px',
      }
    }
  >
    <div 
      className='node-handle-label'
    >
      {label}
    </div>
  </Handle>;
}

const getMaxStringLength = (strings : string[]) => 
  strings.length > 0 ? 
    Math.max(...strings.map((s) => s.length)) : 
    0
;

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

  const containerRef = useRef<HTMLDivElement>(null);

  const inputs = node.worker.inputs;
  const outputs = node.worker.outputs;

  const height = (Math.max(
    Object.entries(inputs).length,
    Object.entries(outputs).length
  ) + 1) * handleSpacing + headerHeight + 'px';

  // TODO: proper width calculation
  const width = (
    Math.max(
      getMaxStringLength(Object.keys(node.worker.inputs)) +
      getMaxStringLength(Object.keys(node.worker.outputs)),
      node.worker.title.length + 2
    )
  ) * 5 + 30 + 'px';

  return <div 
    id={node._id}
    ref={containerRef}
    className='flow-node'
    style={{height, width}}
    onClick={() => console.log('Selected Node', node)}
  >
    <div 
      data-node-id={node._id}
      className='flow-node-header' style={{height: headerHeight}}
    >
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
