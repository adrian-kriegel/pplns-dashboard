
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
  useMemo,
} from 'react';

import { useParams } from 'react-router';

import ReactFlow, {
  applyNodeChanges,
  Edge,
  Node as FlowNodeGeneric,
  NodeChange,
  NodeTypes,
  OnConnect,
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
  nodesById: NodesById;

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
 * @param nodesById nodes by id
 * @returns flow nodes and edges
 */
export function apiNodesToFlow(
  nodes: NodeRead[],
  nodesById : NodesById
) : [FlowNode[], Edge[]]
{
  const flowNodes = nodes.map(apiNodeToFlowNode);

  const edges : Edge[] = [];
  
  for (const consumer of nodes)
  {
    for (const input of consumer.inputs)
    {
      const inputLabel = input.inputChannel;

      if (input.nodeId in nodesById)
      {
        edges.push(
          {
            // eslint-disable-next-line max-len
            id: `e-${input.nodeId}-${input.outputChannel}-${consumer._id}-${inputLabel}`,
            targetHandle: input.outputChannel,
            sourceHandle: inputLabel,
            target: input.nodeId,
            source: consumer._id,
          }
        );
      }
      else 
      {
        console.error(input);
        console.error('Invalid connection.');
      }
    }
  }

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
  const { nodes, onNodeChanged, nodesById } = props;

  // using state for edges and nodes to allow for smoother animations without having to re-call apiNodesToFlow e. g. when dragging nodes
  const [flowNodes, setFlowNodes] = useState<FlowNode[]>([]);
  const [flowEdges, setFlowEdges] = useState<Edge[]>([]);

  useEffect(
    () => 
    {
      const [flowNodes, flowEdges] = apiNodesToFlow(nodes, nodesById);
  
      setFlowEdges(flowEdges);
      setFlowNodes(flowNodes);
    },
    [nodes]
  );

  const onNodesChanged = (changes : NodeChange[]) => 
  {
    const newNodes = applyNodeChanges(changes, flowNodes);

    setFlowNodes(newNodes);

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

  const onConnect : OnConnect = (connection) => 
  {
    const consumerId = connection.source;

    if (!consumerId)
    {
      console.error(connection);
      throw new Error('Invalid connection');
    }

    const consumer = nodes[nodesById[consumerId]];
    
    onNodeChanged(
      consumerId,
      {
        inputs: 
        [
          ...consumer.inputs,
          {
            nodeId: connection.target as string,
            outputChannel: connection.targetHandle as string,
            inputChannel: connection.sourceHandle as string,
          },
        ],
      },
      true,
    );
  };

  return <div
    style={{width: '800px', height: '500px'}}
  >
    <PipelineContext.Provider value={props}>
      <ReactFlow
        onNodesChange={onNodesChanged}
        onConnect={onConnect}
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        fitView
      />
    </PipelineContext.Provider>
  </div>;
}

type NodesById = { [k: string]: number };

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

  const nodesById = useMemo<NodesById>(
    () => Object.fromEntries(
      nodes.map((node, index) => [node._id, index])
    ),
    [nodes]
  );

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
        {...{task, nodes, nodesById}}
        onNodeChanged={
          (nodeId, change, flush) => 
          {
            const newNodes = [...nodes];

            const i = nodesById[nodeId];

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
