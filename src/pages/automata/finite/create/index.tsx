// Import Dependencies
import { Button, PageHeader } from "antd";
import { useState, useRef } from "react";
import { useHistory } from "react-router-dom";
import Layout from "@layout";
import styled from "styled-components";
import ReactJointJS from "react.joint";
import * as joint from "jointjs";
import {
    GraphView, // required
    Edge, // optional
    IEdge, // optional
    // Node, // optional
    INode, // optional
    LayoutEngineType, // required to change the layoutEngineType, otherwise optional
    BwdlTransformer, // optional, Example JSON transformer
    GraphUtils // optional, useful utility functions
  } from 'react-digraph';
import StateMachineEditor from "./StateMachineEditor";
  
// Define Style
const Node = styled.div`
    background-color: blue;
`;

const EmptyNodeShape = (
    <symbol viewBox="0 0 154 154" width="154" height="154" id="emptyNode">
      <circle cx="77" cy="77" r="76" />
    </symbol>
);

const EmptyEdgeShape = (
    <symbol viewBox="0 0 50 50" id="emptyEdge">
        <circle cx="25" cy="25" r="8" fill="currentColor" />
    </symbol>
);
// Define Component
export default function FiniteAutomata(): JSX.Element {
    const [nodes, setNodes] = useState<INode[]>([{ id: 'q0', title: 'q0', x: 100, y: 100, type: 'default' }]);
    const [edges, setEdges] = useState<IEdge[]>([]);
    const [selected, setSelected] = useState<INode | undefined>();
    // Fetch Context
    const history = useHistory();
    // Extra
    const createAutomata = () => console.log("CREATE");
    // graph.
    console.log({nodes, edges})
    // Fetch Data
    return (
        <>
            <Layout>
                    <PageHeader
                        onBack={history.goBack}
                        title="Automatos Finitos"
                        subTitle="Criação"
                        extra={[
                            <Button
                                type="primary"
                                key="button-create"
                                onClick={createAutomata}
                            >
                                Salvar
                            </Button>,
                        ]}
                    />
                    <StateMachineEditor/>
            </Layout>
        </>
    );
}
