import React from "react";

export const NODE_KEY = "id"; // Key used to identify nodes

// These keys are arbitrary (but must match the config)
// However, GraphView renders text differently for empty types
// so this has to be passed in if that behavior is desired.
export const STATE_TYPE = "state"; // Empty node type
export const INITIAL_STATE_TYPE = "initialState"; // Empty node type
export const EMPTY_EDGE_TYPE = "emptyEdge";
export const SPECIAL_EDGE_TYPE = "specialEdge";

export const nodeTypes = [STATE_TYPE, INITIAL_STATE_TYPE];
export const edgeTypes = [EMPTY_EDGE_TYPE, SPECIAL_EDGE_TYPE];
export const nodeSubTypes = [];

const StateShape = (
  <symbol viewBox="0 0 200 200" id="state">
    <circle cx="100" cy="100" r="50" />
  </symbol>
);

const InitialStateShape = (
  <symbol viewBox="0 0 200 200" id="initialState">
    <circle cx="100" cy="100" r="50" />
    <circle cx="100" cy="100" r="40" />
  </symbol>
);

const EmptyEdgeShape = (
  <symbol viewBox="0 0 50 50" id="emptyEdge">
    <circle cx="25" cy="25" r="8" fill="currentColor" />
  </symbol>
);

const SpecialEdgeShape = (
  <symbol viewBox="0 0 50 50" id="specialEdge">
    <rect
      transform="rotate(45)"
      x="27.5"
      y="-7.5"
      width="15"
      height="15"
      fill="currentColor"
    />
  </symbol>
);

export default {
  EdgeTypes: {
    emptyEdge: {
      shape: EmptyEdgeShape,
      shapeId: "#emptyEdge",
      typeText: "Empty"
    },
    specialEdge: {
      shape: SpecialEdgeShape,
      shapeId: "#specialEdge"
    }
  },
  NodeSubtypes: {},
  NodeTypes: {
    state: {
      shape: StateShape,
      shapeId: "#state",
      typeText: "State"
    },
    initialState: {
      shape: InitialStateShape,
      shapeId: "#initialState",
      typeText: "Initial"
    },
  }
};
