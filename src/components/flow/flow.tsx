
import { useState, useCallback } from 'react';

import ReactFlow, {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  Edge,
  Node as FlowNode,
} from 'react-flow-renderer';


/**
 * @returns flow
 */
function Flow() 
{
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const onNodesChange = useCallback<OnNodesChange>(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  const onEdgesChange = useCallback<OnEdgesChange>(
    (changes) => 
    {
      console.log(changes);
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    [setEdges]
  );

  const onConnect = useCallback<OnConnect>(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );


  return <div
    style={{width: '800px', height: '800px'}}
  >
    <ReactFlow
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodes={nodes}
      edges={edges}
      fitView
    />
  </div>;
}

export default Flow;
