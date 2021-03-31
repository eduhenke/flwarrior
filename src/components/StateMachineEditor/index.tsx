import { useState, useEffect } from "react";
import { GraphView, INode, IGraphInput, IEdge } from "react-digraph";
import { Modal, Select, Typography } from 'antd';
import { MachineDBEntry, MachineDBEntryState, MachineType } from '@database/schema/machine';
import {
  default as nodeConfig,
  EMPTY_EDGE_TYPE,
  STATE_TYPE,
  NODE_KEY,
  INITIAL_STATE_TYPE,
} from "./config";
import { NewTransitionModaContent } from "../../pages/automata/finite/MachineEditStyles";

type MachineDiagram = Pick<MachineDBEntry, 'states' | 'transitions'>;
type MachineDBEntryTransition = MachineDBEntry["transitions"][number];

type Props = {
  onUpdate: (machine: MachineDiagram) => void,
  states: MachineDBEntryState[]
  transitions: MachineDBEntryTransition[]
  alphabet: string[]
}

export default function StateMachineEditor({ onUpdate, states = [], transitions = [], alphabet }: Props) {
  const [graph, setGraph] = useState<IGraphInput>({ edges: [], nodes: [] });
  const [selected, setSelected] = useState<INode | undefined>();
  const convertStateToNode = (state: MachineDBEntryState, offset = 0): INode =>
    graph.nodes.find(node => node.id === state.id)
    ?? ({
      id: "q" + offset,
      title: "q" + offset,
      type: state.isEntry ? INITIAL_STATE_TYPE : STATE_TYPE,
      x: Math.cos(offset / 2) * Math.log2(offset + 1) * 120,
      y: Math.sin(offset / 2) * Math.log2(offset + 1) * 120,
    });

    const [newTransFrom, setNewTransFrom] = useState<string>();
    const [newTransTo, setNewTransTo] = useState<string>();
    const [newTransWith, setNewTransWith] = useState<string>();
    const [modalNewTransitionVisible, setModalNewTransitionVisible] = useState(false);


    const showNewTransitionModal = (sourceViewNode, targetViewNode) => {
      setNewTransFrom(sourceViewNode);
      setNewTransTo(targetViewNode);
      setNewTransWith(undefined);
      setModalNewTransitionVisible(true);
  };


  const convertTransitionsToEdge = (transition: MachineDBEntryTransition): IEdge => {
      return graph.edges.find(edge => edge.source === transition.from && edge.target === transition.to.newState)
      ?? ({
        source: transition.from,
        target: transition.to.newState,
        handleText: transition.to.writeSymbol
      })}
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
        to: { headDirection: 'right', writeSymbol: edge.handleText, newState: edge.target },
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
      edges: transitions
      .filter(
        transition =>
          typeof transition.from === 'string' &&
          typeof transition.to.newState === 'string' &&
          states.map(state => state.id).includes(transition.from) &&
          states.map(state => state.id).includes(transition.to.newState)
      )
      .map(convertTransitionsToEdge),
    })
  }, [states, transitions]);

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
    showNewTransitionModal(sourceViewNode, targetViewNode);
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
      <Modal
          title="Adicionar nova transição"
          centered
          visible={modalNewTransitionVisible}
          okText="Adicionar"
          cancelText="Cancelar"
          okButtonProps={{
              disabled: newTransWith === undefined
              ,
          }}
          onOk={() => {
            const viewEdge = {
              source: newTransFrom[NODE_KEY],
              target: newTransTo[NODE_KEY],
              type: EMPTY_EDGE_TYPE,
              title: '',
              handleText: newTransWith,
            };
            setGraph({ ...graph, edges: [...graph.edges, viewEdge] });
            setSelected(viewEdge);
            setModalNewTransitionVisible(false)
            setNewTransWith(undefined);              
          }}
          onCancel={() => setModalNewTransitionVisible(false)}
      >
          <NewTransitionModaContent>
              {/* <Typography.Text>De (Estado):</Typography.Text> */}
              <Typography.Text>Lendo (Símbolo):</Typography.Text>
              {/* <Typography.Text>Para (Estado):</Typography.Text> */}
              {/* <Select
                  value={newTransFrom}
                  defaultActiveFirstOption
                  onChange={(from) =>
                      setNewTransFrom(from.toString())
                  }
              >
                  {states?.map((state) => (
                      <Select.Option
                          value={state.id}
                          key={state.id + "b"}
                      >
                          {state.id}
                      </Select.Option>
                  ))}
              </Select> */}
              <Select
                  value={newTransWith}
                  defaultActiveFirstOption
                  onChange={(withSymbol) =>
                      setNewTransWith(withSymbol.toString())
                  }
              >
                  {alphabet?.map((alphabetSymbol) => (
                      <Select.Option
                          value={alphabetSymbol}
                          key={alphabetSymbol + "d"}
                      >
                          {alphabetSymbol}
                      </Select.Option>
                  ))}
              </Select>
              {/* <Select
                  defaultActiveFirstOption
                  value={newTransTo}
                  onChange={(to) => setNewTransTo(to.toString())}
              >
                  {states?.map((state) => (
                      <Select.Option
                          value={state.id}
                          key={state.id + "c"}
                      >
                          {state.id}
                      </Select.Option>
                  ))}
              </Select> */}
          </NewTransitionModaContent>
      </Modal>
      <Typography>Shift+Click para adicionar estados</Typography>
      <Typography>Shift+Click entre estados para adicionar transições</Typography>
      <GraphView
        showGraphControls={true}
        // gridDotSize={1}
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
        edgeArrowSize={12}
      />
    </>
  );
}
