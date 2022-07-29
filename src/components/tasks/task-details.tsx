
import type { 
  Task,
  NodeRead,
  NodeWrite,
} from 'annotation-api/src/schemas/pipeline';

import {
  useState,
  useEffect,
  createContext,
  useContext,
} from 'react';

import { useParams } from 'react-router';

import ReactFlow, {
  applyEdgeChanges,
  applyNodeChanges,
  Edge,
  Node as FlowNodeGeneric,
  NodeChange,
  NodeTypes,
} from 'react-flow-renderer';

import LoadingFrame from '@unologin/react-ui/info/loading';

import * as api from '../../api';
import Workers from '../workers/workers';

import NodeComponent from './node-component';

export type FlowNode = FlowNodeGeneric<{ node : NodeRead }>;

export type PipelineProps = 
{
  task: Task;
  nodes: NodeRead[];

  onNodeChanged: (
    nodeId : NodeRead['_id'],
    change : Partial<NodeRead> | 'delete',
    flush : boolean 
  ) => unknown;
}

export type TaskDetailsProps = 
{
  taskId?: Task['_id'];
}


export const PipelineContext = createContext<PipelineProps>(null as any);

export const usePipeline = () => useContext(PipelineContext);

const nodeTypes : NodeTypes = 
{
  node: NodeComponent,
};

/**
 * 
 * @param node node
 * @returns flow node
 */
export function apiNodeToFlowNode(
  node : NodeRead
) : FlowNode
{
  return {
    id: node._id,
    type: 'node',
    data: { node },
    position: node.position,
  };
}

/**
 * @param nodes nodes from the API
 * @returns flow nodes and edges
 */
export function apiNodesToFlow(
  nodes: NodeRead[]
) : [FlowNode[], Edge[]]
{
  const flowNodes = nodes.map(apiNodeToFlowNode);

  const edges : Edge[] = [];

  return [flowNodes, edges];
}

/**
 * @param props PipelineProps
 * @returns pipeline editor
 */
export function Pipeline(
  props : PipelineProps
)
{
  const { nodes, onNodeChanged } = props;

  // using state for edges and nodes instead of using props
  // because the built in handlers are better at allowing for animations when interacting
  const [flowNodes, setNodes] = useState<FlowNode[]>([]);
  const [flowEdges, setEdges] = useState<Edge[]>([]);

  useEffect(
    () => 
    {
      const [newNodes, newEdges] = apiNodesToFlow(nodes);

      setNodes(newNodes);
      setEdges(newEdges);
    },
    [nodes]
  );

  const onNodesChanged = (changes : NodeChange[]) => 
  {
    const newNodes = applyNodeChanges(changes, flowNodes);

    setNodes(newNodes);

    for (const change of changes)
    {
      if (change.type === 'position' && !change.dragging)
      {
        onNodeChanged(
          change.id,
          { position: newNodes.find(({ id }) => id === change.id)?.position },
          true,
        );
      }
    }
  };

  return <div
    style={{width: '800px', height: '500px'}}
  >
    <PipelineContext.Provider value={props}>
      <ReactFlow
        onNodesChange={onNodesChanged}
        onEdgesChange={(c) => setEdges(applyEdgeChanges(c, flowEdges))}
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        fitView
      />
    </PipelineContext.Provider>
  </div>;
}

/**
 * 
 * @param param0 props
 * @returns task details view/editor
 */
export default function TaskDetails(
  { taskId } : TaskDetailsProps
)
{
  if (!taskId)
  {
    taskId = useParams().taskId;
  }

  const [task, setTask] = useState<Task>();

  const [nodes, setNodes] = useState<NodeRead[]>([]);

  const fetchData = async () => 
  {
    const [task, nodes] = await Promise.all(
      [
        api.get<Task>(`/tasks/${taskId}`),
        api.get<api.GetResponse<NodeRead>>(`/tasks/${taskId}/nodes`),
      ]
    );

    setTask(task);
    setNodes(nodes.results);
  };

  // TODO display loading state or something
  const flushNode = async (node : NodeRead) => 
  {
    await api.patch(
      `/tasks/${taskId}/nodes/${node._id}`,
      node,
    );
  };

  useEffect(
    () => { fetchData(); },
    []
  );

  const createNode = async (
    node : Omit<NodeWrite, 'inputs'>
  ) =>
  {
    const nodeWrite = 
    {
      ...node,
      inputs: [],
    };

    setNodes([
      ...nodes,
      await api.post<NodeRead>(
        `/tasks/${taskId}/nodes`,
        nodeWrite,
      ),
    ]);
  };

  const deleteNode = async (
    nodeId: NodeRead['_id'],
  ) => 
  {
    return api.del(
      `/tasks/${taskId}/nodes/${nodeId}`
    );
  };

  if (task && nodes)
  {
    return <>
      <Pipeline 
        {...{task, nodes}}
        onNodeChanged={
          (nodeId, change, flush) => 
          {
            const newNodes = [...nodes];

            const i = nodes.findIndex(({ _id }) => _id === nodeId);

            if (change === 'delete')
            {
              newNodes.splice(i, 1);
            }
            else 
            {
              newNodes[i] = 
              {
                ...newNodes[i],
                ...change,
              };
            }

            setNodes(newNodes);

            if (flush)
            {
              if (change === 'delete')
              {
                return deleteNode(nodeId);
              }
              else 
              {
                return flushNode(newNodes[i]);
              }
            }
          }
        }
      />
      <Workers
        onClick={
          (worker) => createNode(
            {
              workerId: worker._id,
              position: { x: 0, y: 0 },
            }
          )
        }
      />
    </>;
  }
  else 
  {
    return <LoadingFrame />;
  }
}
