import { useState, useEffect } from "react";
import { GraphView, INode, IGraphInput, IEdge } from "react-digraph";
import { Typography } from 'antd';
import { MachineDBEntry, MachineDBEntryState, MachineType } from '@database/schema/machine';
import {
  default as nodeConfig,
  EMPTY_EDGE_TYPE,
  STATE_TYPE,
  NODE_KEY,
  INITIAL_STATE_TYPE,
} from "./config";

type MachineDiagram = Pick<MachineDBEntry, 'states' | 'transitions'>;
type MachineDBEntryTransition = MachineDBEntry["transitions"][number];

type Props = {
  onUpdate: (machine: MachineDiagram) => void,
  states: MachineDBEntryState[]
  transitions: MachineDBEntryTransition[]
}

export default function StateMachineEditor({ onUpdate, states = [], transitions = [] }: Props) {
  const [graph, setGraph] = useState<IGraphInput>({ edges: [], nodes: [] });
  const [selected, setSelected] = useState<INode | undefined>();
  const convertStateToNode = (state: MachineDBEntryState, offset = 0): INode =>
    graph.nodes.find(node => node.id === state.id)
    ?? ({
      id: state.id,
      title: state.id,
      type: state.isEntry ? INITIAL_STATE_TYPE : STATE_TYPE,
      x: offset * 100,
      y: 0,
    });

  const convertTransitionsToEdge = (transition: MachineDBEntryTransition): IEdge =>
    graph.edges.find(edge => edge.source === transition.from && edge.target === transition.to.newState)
    ?? ({
      source: transition.from,
      target: transition.to.newState,
    })
  ;

  const convertGraphToMachine = (graph: IGraphInput): MachineDiagram => ({
    states: graph.nodes.map(
      node => ({
        id: node.title,
        isEntry: node.type === INITIAL_STATE_TYPE,
        isExit: false
      })
    ),
    transitions: graph.edges.map(
      edge => ({
        from: edge.source,
        to: { headDirection: 'right', writeSymbol: '', newState: edge.target },
        with: { head: '', memory: '' }
      })
    ),
  })

  console.log({ graph })
  useEffect(() => {
    onUpdate(convertGraphToMachine(graph));
  }, [graph]);

  useEffect(() => {
    setGraph({
      ...graph,
      nodes: states.map(convertStateToNode),
      // edges: transitions.map(convertTransitionsToEdge)
    })
  }, [states, /* transitions */]);

  const getNodeIndex = (searchNode) =>
    graph.nodes.findIndex(node => node[NODE_KEY] === searchNode[NODE_KEY])

  // Helper to find the index of a given edge
  const getEdgeIndex = (searchEdge) =>
    graph.edges.findIndex(edge =>
      edge.source === searchEdge.source && edge.target === searchEdge.target);

  /*
   * Handlers/Interaction
   */

  // Called by 'drag' handler, etc..
  // to sync updates from D3 with the graph
  const onUpdateNode = viewNode => {
    const i = getNodeIndex(viewNode);

    graph.nodes[i] = viewNode;
    setGraph(graph);
  };

  // Node 'mouseUp' handler
  const onSelectNode = (viewNode, event) => {
    const { id = "" } = event.target;
    if (id.includes("text")) {
      document.getElementById(event.target.id).click();
    }

    // Deselect events will send Null viewNode
    setSelected(viewNode);
  };

  // Edge 'mouseUp' handler
  const onSelectEdge = viewEdge => {
    setSelected(viewEdge);
  };

  // Updates the graph with a new node
  const onCreateNode = (x, y) => {

    // This is just an example - any sort of logic
    // could be used here to determine node type
    // There is also support for subtypes. (see 'sample' above)
    // The subtype geometry will underlay the 'type' geometry for a node
    // const type = Math.random() < 0.25 ? SPECIAL_TYPE : CUSTOM_EMPTY_TYPE;

    const viewNode = {
      id: Date.now(),
      title: 'q' + graph.nodes.length,
      type: graph.nodes.length ? STATE_TYPE : INITIAL_STATE_TYPE,
      x,
      y
    };

    setGraph({ ...graph, nodes: [...graph.nodes, viewNode] });
  };

  // Deletes a node from the graph
  const onDeleteNode = (viewNode, nodeId, nodes) => {
    // Delete any connected edges
    const newEdges = graph.edges.filter((edge, i) => (
      edge.source !== viewNode[NODE_KEY] && edge.target !== viewNode[NODE_KEY]
    ));

    setGraph({
      nodes,
      edges: newEdges
    });
    setSelected(null);
  };

  // Creates a new node between two edges
  const onCreateEdge = (sourceViewNode, targetViewNode) => {
    const viewEdge = {
      source: sourceViewNode[NODE_KEY],
      target: targetViewNode[NODE_KEY],
      type: EMPTY_EDGE_TYPE,
      title: ''
    };

    setGraph({ ...graph, edges: [...graph.edges, viewEdge] });
    setSelected(viewEdge);
  };

  // Called when an edge is reattached to a different target.
  const onSwapEdge = (sourceViewNode, targetViewNode, viewEdge) => {
    const i = getEdgeIndex(viewEdge);
    const edge = JSON.parse(JSON.stringify(graph.edges[i]));

    edge.source = sourceViewNode[NODE_KEY];
    edge.target = targetViewNode[NODE_KEY];
    graph.edges[i] = edge;
    // reassign the array reference if you want the graph to re-render a swapped edge
    graph.edges = [...graph.edges];

    setGraph(graph);
    setSelected(edge);
  };

  // Called when an edge is deleted
  const onDeleteEdge = (viewEdge, edges) => {

    graph.edges = edges;
    setGraph(graph);
    setSelected(null);
  };

  return (
    <>
      <Typography>Shift+Click para adicionar estados</Typography>
      <Typography>Shift+Click entre estados para adicionar transições</Typography>
      <GraphView
        showGraphControls={true}
        gridDotSize={1}
        nodeKey={NODE_KEY}
        nodes={graph.nodes}
        edges={graph.edges}
        selected={selected}
        nodeTypes={nodeConfig.NodeTypes}
        nodeSubtypes={nodeConfig.NodeSubtypes}
        edgeTypes={nodeConfig.NodeTypes}
        onSelectNode={onSelectNode}
        onCreateNode={onCreateNode}
        onUpdateNode={onUpdateNode}
        onDeleteNode={onDeleteNode}
        onSelectEdge={onSelectEdge}
        onCreateEdge={onCreateEdge}
        onDeleteEdge={onDeleteEdge}
      />
    </>
  );
}
