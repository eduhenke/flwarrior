// Import Dependencies
import { Button, PageHeader } from "antd";
import { useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import RegisteredItemsListRaw from "@components/RegisteredItemsList";
import Layout from "@layout";
import styled from "styled-components";
import IconBase from "@ant-design/icons";
import { ReactComponent as Graph } from "@assets/graph.svg";
import DatabaseService from "@database";
import { FLWarriorDBTables } from "@/database/schema";
import useAsyncEffect from "@/utils/useAsyncEffect";
import { MachineDBEntry } from "@/database/schema/machine";
// Define Style
const MachinesList = styled.section`
    height: 100%;
    display: flex;
    flex-direction: column;
`;
const RegisteredItemsList = styled(RegisteredItemsListRaw)`
    /* Full Panel Size */
    flex-grow: 1;
    margin-bottom: 1rem;

    /* Align center */
    width: calc(100% - 48px);
    margin: 1.5rem auto;

    /* Pagination on End */
    display: flex;
    flex-direction: column;
    justify-content: space-between;
`;
const GraphAvatar = styled(IconBase).attrs({ component: Graph })`
    font-size: 2em;
`;
// Define Component
export default function FiniteAutomata(): JSX.Element {
    // Setup State
    const [machineList, setMachineList] = useState<Array<MachineDBEntry>>([]);
    // Fetch Context
    const history = useHistory();
    // Fetch Data
    useAsyncEffect(async () => {
        const db = await DatabaseService.getDb();
        const machines = await db.getAll(FLWarriorDBTables.MACHINE);

        setMachineList(machines);
        console.log(machines);
    }, []);
    const machineListDataSource = useMemo(
        () =>
            machineList.map((machine) => ({
                id: machine.id,
                name: machine.name,
                avatar: <GraphAvatar />,
                onEdit: (itemId: string) => {
                    console.log("EDIT - ", itemId);
                },
                onDelete: (itemId: string) => {
                    console.log("DELETE - ", itemId);
                },
                onExport: (itemId: string) => {
                    console.log("EXPORT - ", itemId);
                },
            })),
        [machineList]
    );
    // Extra
    const createAutomata = () => history.push('/automata/finite/create');
    
    // Fetch Data
    return (
        <>
            <Layout>
                <MachinesList>
                    <PageHeader
                        onBack={history.goBack}
                        title="Automatos Finitos"
                        subTitle="Listagem"
                        extra={[
                            <Button
                                type="primary"
                                key="button-create"
                                onClick={createAutomata}
                            >
                                Criar Autômato
                            </Button>,
                        ]}
                    />
                    <RegisteredItemsList dataSource={machineListDataSource} />
                </MachinesList>
            </Layout>
        </>
    );
}
