
import type { 
  NodeRead, 
} from 'annotation-api/src/pipeline/schemas';
import { useEffect, useState } from 'react';

type NodeParamInputProps<T> = 
{
  value: T | undefined;
  label: string;
  onChange: (v : T) => void;
}

/**
 * TODO: handle more data types than just string
 * @param param0 props
 * @returns input for data type
 */
function NodeParamInput<T>(
  { label, value, onChange } : NodeParamInputProps<T>
)
{
  return <div>
    <label>{label}</label>
    <input
      type='text'
      value={value as any as string || ''}
      onChange={(e) => onChange(e.target.value as any as T)}
    />
  </div>;
}

/**
 * 
 * @param param0 props
 * @returns node props inspector/editor
 */
export default function NodeProps(
  { node } : { node: NodeRead}
)
{
  const workerParams = node.worker.params;

  const [params, setParams] = useState<NodeRead['params']>(node.params || {});

  useEffect(() => setParams(node.params || {}), [node]);

  return <>
    <h1>{node.worker.title}</h1>
    <h2>Parameters</h2>
    {
      params && Object.entries(workerParams).map(([name]) => 
        <NodeParamInput
          label={name}
          value={params[name]}
          onChange={(v) => setParams({ ...params, [name]: v })}
        />
      )
    }
  </>;
}
