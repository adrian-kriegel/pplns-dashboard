
import type { 
  Task,
  NodeRead,
  NodeWrite,
} from '@pplns/schemas';

import {
  useState,
  useEffect,
  createContext,
  useContext,
  useMemo,
  useCallback,
  useRef,
} from 'react';

import { useParams } from 'react-router';

import ReactFlow, {
  applyNodeChanges,
  Edge,
  EdgeTypes,
  Node as FlowNodeGeneric,
  NodeChange,
  NodeTypes,
  OnConnect,
} from 'react-flow-renderer';

import LogContext from '@unologin/react-ui/info/log-context';

import { SmartBezierEdge } from '@tisoap/react-flow-smart-edge';

import LoadingFrame from '@unologin/react-ui/info/loading';

import * as api from '../../api';

import NodeComponent from './node-component';

import './flow-styles.scss';
import onKeyPressed from '../../hooks/on-keypressed';
import { ContextMenu } from '../general/context-menu';
import NodeMenu from './context-menus/node-context-menu';
import LogInfo from '@unologin/react-ui/info/log-info';
import TaskContextMenu from './context-menus/task-context-menu';

export type FlowNode = FlowNodeGeneric<{ node : NodeRead }>;

export type NodeId = NodeRead['_id'];

export type PipelineProps = 
{
  task: Task;
  nodes: NodeRead[];
  nodesById: NodesById;

  onNodeChanged: (
    nodeId : NodeId,
    change : Partial<NodeRead> | 'delete',
    flush : boolean 
  ) => unknown;

  createNode: (node : Omit<NodeWrite, 'inputs'>) => any;

  patchNode: (nodeId: string, changes : Partial<NodeWrite>) => any;
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

const edgeTypes : EdgeTypes = 
{
  default: SmartBezierEdge,
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
 * @param deleteInput input deletion callback
 * @returns flow nodes and edges
 */
export function apiNodesToFlow(
  nodes: NodeRead[],
  nodesById : NodesById,
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
            targetHandle: inputLabel,
            sourceHandle: input.outputChannel,
            source: input.nodeId,
            target: consumer._id,
            // label: `${sourceNode.worker.title}.${input.outputChannel}`,
            type: 'default',
            zIndex: 1,
            className: 'flow-edge',
          }
        );
      }
      else 
      {
        console.error({ input, consumer });
        console.error('Deleting invalid connection.');
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
      const [flowNodes, flowEdges] = apiNodesToFlow(
        nodes,
        nodesById,
      );
  
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
          // TODO: this can probably be done using nodesById
          // but idk if the nodes will stay in order after applyNodeChanges (they probably do)
          { position: newNodes.find(({ id }) => id === change.id)?.position },
          true,
        );
      }
    }
  };

  const onConnect : OnConnect = (connection) => 
  {
    const consumerId = connection.target;

    if (!consumerId)
    {
      console.error(connection);
      throw new Error('Invalid connection');
    }

    const consumer = nodes[nodesById[consumerId]];
    
    const inputChannel = connection.targetHandle as string;
    const outputChannel = connection.sourceHandle as string;

    // check if there already is a connection on the same input
    const existingConnection = consumer.inputs.find(
      ({ inputChannel: c }) => inputChannel === c
    );

    if (!existingConnection)
    {
      onNodeChanged(
        consumerId,
        {
          inputs: 
          [
            ...consumer.inputs,
            {
              nodeId: connection.source as string,
              outputChannel,
              inputChannel,
            },
          ],
        },
        true,
      );
    }
  };

  // delete the edge to the specified input on the consumer node
  const deleteInput = useCallback(
    (consumer : NodeRead, inputChannel : string) => 
    {
      onNodeChanged(
        consumer._id,
        { 
          inputs: consumer.inputs.filter(
            ({ inputChannel: c }) => c !== inputChannel
          ), 
        },
        true
      );
    },
    [flowEdges, onNodeChanged]
  );

  onKeyPressed('Delete', () => 
  {
    const selected = flowEdges.find(({ selected }) => selected);
    
    if (selected)
    {
      const consumer = nodes[nodesById[selected.target]];

      deleteInput(consumer, selected.targetHandle as string);
    }
  });

  const containerRef = useRef<HTMLDivElement>(null);

  const renderContextMenu = useCallback(
    (e : MouseEvent) => 
    {
      if (e.target instanceof HTMLDivElement)
      {
        const nodeId = e.target.getAttribute('data-node-id');

        if (nodeId && nodeId in nodesById)
        {
          return <NodeMenu node={nodes[nodesById[nodeId]]} />;
        }
        else 
        {
          return <TaskContextMenu />;
        }
      }
      else 
      {
        return null;
      }
    },
    [nodes],
  );

  return <div
    ref={containerRef}
    style={{width: '1600px', height: '700px'}}
  >
    <PipelineContext.Provider value={props}>
      <ReactFlow
        onNodesChange={onNodesChanged}
        onConnect={onConnect}
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onEdgeClick={
          (_, clickedEdge) => 
          {
            const newEdges = [...flowEdges];

            for (const edge of newEdges)
            {
              edge.selected = (edge.id === clickedEdge.id);
            }

            setFlowEdges(newEdges);
          }
        }
        fitView
      />

      <ContextMenu
        container={containerRef}
        render={renderContextMenu}
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

  const containerRef = useRef<HTMLDivElement>(null);

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

  // TODO display loading state or something
  const patchNode = async (
    nodeId: string, 
    changes : Partial<NodeRead>
  ) => 
  {
    await api.patch(
      `/tasks/${taskId}/nodes/${nodeId}`,
      changes,
    );
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
    return <div ref={containerRef}>
      <LogContext.Provider >
        <Pipeline 
          {
            ...{
              task,
              nodes,
              nodesById,
              createNode,
              patchNode,
            }
          }
          onNodeChanged={
            (nodeId, change, flush) => 
            {
              let newNodes;

              const i = nodesById[nodeId];

              if (change === 'delete')
              {
                newNodes = nodes.map(
                  (node) => (
                    {
                      ...node,
                      inputs: node.inputs.filter(
                        (input) => input.nodeId !== nodeId 
                      ),
                    }
                  )
                );

                newNodes.splice(i, 1);
              }
              else 
              {
                newNodes = [...nodes];
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
                  return patchNode(nodeId, change);
                }
              }
            }
          }
        />
        <LogContext.Consumer>
          {
            ({ logs, removeLog }) => logs.map((log) => 
              <LogInfo
                type={log.type}
                onClose={() => removeLog(log.id)}
              >
                {log.msg}
              </LogInfo>
            )
          }
        </LogContext.Consumer>
      </LogContext.Provider>
    </div>;
  }
  else 
  {
    return <LoadingFrame />;
  }
}
