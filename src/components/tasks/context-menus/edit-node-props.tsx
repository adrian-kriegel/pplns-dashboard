
import type { 
  NodeRead, 
} from '@pplns/schemas';
import useButton from '@unologin/react-ui/hooks/use-button';
import Button from '@unologin/react-ui/inputs/button';
import { useCallback, useEffect, useState } from 'react';
import { usePipeline } from '../task-details';

type NodeParamInputProps<T> = 
{
  value: T | undefined;
  label: string;
  name: string;
  onChange: (v : T) => void;
}

/**
 * TODO: handle more data types than just string
 * @param param0 props
 * @returns input for data type
 */
function NodeParamInput<T>(
  { name, label, value, onChange } : NodeParamInputProps<T>
)
{
  return <div>
    <label>{label}</label>
    <input
      key={name}
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
export default function EditNodeProps(
  { node } : { node: NodeRead }
)
{
  const { onNodeChanged } = usePipeline();

  const workerParams = node.worker.params;

  const [params, setParams] = useState<NodeRead['params']>(
    node.params || {}
  );

  useEffect(() => setParams(node.params || {}), [node]);
  
  const btn = useButton();

  const submit = useCallback(async () => 
  {
    btn.setLoading(true);

    await onNodeChanged(node._id, { params }, true);

    btn.setLoading(false);
    btn.setDone(true);
  }, [node, params]);

  return <>
    <h1>{node.worker.title}</h1>
    <h2>Parameters</h2>
    {
      params && Object.entries(workerParams).map(([name]) => 
        <NodeParamInput
          key={name}
          label={name}
          name={name}
          value={params[name]}
          onChange={(v) => setParams({ ...params, [name]: v })}
        />
      )
    }
    <Button 
      label='save'
      {...btn.state}
      onClick={submit}
    />
  </>;
}
