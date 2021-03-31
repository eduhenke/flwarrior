// Import Dependencies
import {
    PageHeader,
    List,
    Button,
    Typography,
    Checkbox,
    Modal,
    Select,
} from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { useState, useMemo } from "react";
import { useParams, useHistory } from "react-router-dom";
import deepEqual from "deep-equal";
import Layout from "@layout";
import useAsyncEffect from "@/utils/useAsyncEffect";
import { useDatabase } from "@database";
import { FLWarriorDBTables } from "@database/schema";
import type {
    MachineDBEntry,
    MachineDBEntryState,
} from "@database/schema/machine";
import type { ArrayElement } from "@/utils/ArrayElement";
import { useModal } from "@components/TextModalInput";
import StateMachineEditor from "@components/StateMachineEditor";
import { machineIsDeterministic } from "@/lib/utils";
import { MachineEditContent, MachineEditGrid, RulesContainer, AlphabetList, AlphabetListHeader, SelectBar, NewTransitionModaContent } from "./MachineEditStyles";
// Define Typings
export interface ITGEditPageProps {
    id: string;
}
// Define Page
export default function RegularGrammarEdit(): JSX.Element {
    
    const history = useHistory();
    const { id: idToEdit } = useParams<ITGEditPageProps>();

    const [machineDb, setMachineDb] = useState<MachineDBEntry>();
    const [unsavedMachine, setUnsavedMachine] = useState<MachineDBEntry>();

    
    useAsyncEffect(async () => {
        const db = await useDatabase();
        const machinerEntry = await db.get(FLWarriorDBTables.MACHINE, idToEdit);
        setMachineDb(machinerEntry);
    }, []);
    // Define Computed Values
    const alphabet = useMemo(() => machineDb?.entryAlphabet, [machineDb?.entryAlphabet]);
    const states = useMemo(() => machineDb?.states ?? [], [machineDb?.states]);
    const transitions = useMemo(() => machineDb?.transitions ?? [], [machineDb?.transitions]);

    const initialState = useMemo(
        () => machineDb?.states?.find((s) => s.isEntry)?.id,
        [machineDb?.states]
    );
    // Components Handlers
    const renameMachine = (newName: string) => {
        setMachineDb(machine => ({ ...machine, name: newName }));
    };
    const saveMachine = async () => {
        // Fetch Database
        const db = await useDatabase();
        await db.put(FLWarriorDBTables.MACHINE, unsavedMachine);
    };
    const newState = (stateName: string) => {
        setMachineDb((machine) => {
            if (machine.states.findIndex((s) => s.id === stateName) === -1) {
                machine.states.push({
                    id: stateName,
                    isEntry: false,
                    isExit: false,
                });
            }
            return { ...machine };
        });
    };

    const deleteState = (stateName: string) => {
      setMachineDb((machine) => {
        const stateToDeleteIdx = machine.states.findIndex(
            (s) => s.id === stateName
        );
        if (stateToDeleteIdx >= 0) {
            machine.states.splice(stateToDeleteIdx, 1);
        }
        return { ...machine };
      });
    };
    
    const newTransition = ({from, to}: {from: string, to: string}) => {
        setMachineDb((machine) => {
            if (machine.transitions.findIndex((t) => t.from === from && t.to.newState === to) === -1) {
                machine.transitions.push({
                  from,
                  to: { headDirection: 'right', newState: to, writeSymbol: '' },
                  with: { head: '', memory: '' }
                });
            }
            return { ...machine };
          });
        };

    const addNewTransition = (from: string, to: string, withSymbol: string) => {
        if (
            machineDb.transitions.findIndex(
                (t) =>
                    t.from === from &&
                    t.to.newState === to &&
                    t.with.head === withSymbol
            ) === -1
        ) {
            setMachineDb((machine) => {
                machine.transitions.push({
                    from,
                    to: {
                        newState: to,
                        headDirection: null,
                        writeSymbol: null,
                    },
                    with: {
                        head: withSymbol,
                        memory: null,
                    },
                });
                return {
                    ...machine,
                    deterministic: machineIsDeterministic(machine),
                };
            });
        }
    };

    const addAlphabetSymbol = (newSymbol: string) => {
        setMachineDb((machine) => {
            if (!machine.entryAlphabet.includes(newSymbol)) {
                machine.entryAlphabet.push(newSymbol);
            }
            return { ...machine };
        });
    };
    const deleteAlphabetSymbol = (symbolToDelete: string) => {
        setMachineDb((machine) => {
            const symbolToDeleteIdx = machine.entryAlphabet.findIndex(
                (as) => as === symbolToDelete
            );
            if (symbolToDeleteIdx >= 0) {
                machine.entryAlphabet.splice(symbolToDeleteIdx, 1);
            }
            return { ...machine };
        });
    };
    const deleteTransition = (
        transition: ArrayElement<MachineDBEntry["transitions"]>
    ) => {
        const toDeleteIdx = machineDb.transitions.findIndex((t) =>
            deepEqual(t, transition)
        );
        if (toDeleteIdx >= 0) {
            setMachineDb((machine) => {
                machine.transitions.splice(toDeleteIdx, 1);
                return {
                    ...machine,
                    deterministic: machineIsDeterministic(machine),
                };
            });
        }
    };
    const setInitalState = (state: string) => {
        setMachineDb((machine) => {
            return {
                ...machine,
                states: machine.states.map((s) => ({
                    ...s,
                    isEntry: s.id === state,
                })),
            };
        });
    };
    const setIsExitState = (state: string, isExitState: boolean) => {
        const stateIdx = machineDb.states.findIndex((s) => s.id === state);
        setMachineDb((machine) => {
            // eslint-disable-next-line no-param-reassign
            machine.states[stateIdx].isExit = isExitState;
            return { ...machine };
        });
    };
    // Setup Modals
    const [showModalState, modalStateCH] = useModal({
        title: "Adicionar estado",
        onSubmit: newState,
        placeholder: "Insira o nome do novo estado",
        submitText: "Adicionar",
        submitDisabled: (ci) => ci.length < 1,
    });
    const [showModalAlphabetSymbol, modalAlphabetSymbolCH] = useModal({
        title: "Adicionar símbolo ao alfabeto",
        onSubmit: addAlphabetSymbol,
        placeholder: "Insira o novo símbolo",
        submitText: "Adicionar",
        submitDisabled: (ci) => ci.length !== 1,
    });
    const [showModalRename, modalRenameCH] = useModal({
        title: "Renomear Autômato",
        onSubmit: renameMachine,
        placeholder: machineDb?.name,
        submitText: "Renomear",
        submitDisabled: (ci) => !(ci.length >= 1),
    });

    // Render Page
    return (
        <>
            <Layout>
                <MachineEditContent>
                    <PageHeader
                        onBack={history.goBack}
                        title={`Editar - ${machineDb?.name || idToEdit}`}
                        subTitle="Autômato Finito"
                        extra={[
                            <Button
                                key="button-rename"
                                onClick={showModalRename}
                                type="dashed"
                            >
                                Renomear
                                {modalRenameCH}
                            </Button>,
                            <Button
                                key="button-save"
                                onClick={saveMachine}
                                icon={<SaveOutlined />}
                            >
                                Salvar
                            </Button>,
                        ]}
                    />
                    <MachineEditGrid>
                        {/* List of Transitions */}
                        <RulesContainer>
                            <StateMachineEditor
                                onUpdate={diagram => {
                                  setUnsavedMachine({...machineDb, ...diagram})
                                }}
                                states={states}
                                transitions={transitions}
                                alphabet={alphabet}
                            />
                        </RulesContainer>
                        {/* <RulesList
                            bordered
                            header={
                                <Typography.Text>
                                    Regras de Transição
                                </Typography.Text>
                            }
                            style={{ gridArea: "rules" }}
                            dataSource={transitions}
                            renderItem={(
                                item: ArrayElement<
                                    MachineDBEntry["transitions"]
                                >,
                                index
                            ) => (
                                <List.Item
                                    key={index}
                                    actions={[
                                        <Button
                                            danger
                                            key="remove-rule"
                                            onClick={() =>
                                                deleteTransition(item)
                                            }
                                        >
                                            Deletar Transição
                                        </Button>,
                                    ]}
                                >
                                    <RuleHead>
                                        <Typography.Text strong>
                                            {item.from}[{item.with.head}]
                                        </Typography.Text>
                                        <RightArrow />
                                    </RuleHead>
                                    <RuleBody>{item.to.newState}</RuleBody>
                                </List.Item>
                            )}
                        /> */}
                        <AlphabetList
                            dataSource={states}
                            style={{
                                gridArea: "states",
                            }}
                            bordered
                            header={
                                <AlphabetListHeader>
                                    <Typography.Text>Estados</Typography.Text>
                                    <Button onClick={showModalState}>
                                        Adicionar
                                    </Button>
                                    {modalStateCH}
                                </AlphabetListHeader>
                            }
                            renderItem={(state: MachineDBEntryState, index) => (
                                <List.Item
                                    key={index + "e"}
                                    actions={[
                                        <Checkbox
                                            key="button-exit-state"
                                            checked={state.isExit}
                                            onChange={() =>
                                                setIsExitState(
                                                    state.id,
                                                    !state.isExit
                                                )
                                            }
                                        >
                                            Saída ?
                                        </Checkbox>,
                                        <Button
                                            key="button-delete-state"
                                            onClick={() =>
                                                deleteState(state.id)
                                            }
                                            danger
                                        >
                                            Deletar
                                        </Button>,
                                    ]}
                                >
                                    <List.Item.Meta title={state.id} />
                                </List.Item>
                            )}
                        />
                        <SelectBar style={{ gridArea: "entry" }}>
                            <Typography.Text>Estado de Entrada</Typography.Text>
                            <Select
                                defaultActiveFirstOption
                                value={initialState}
                                onChange={(state) =>
                                    setInitalState(state.toString())
                                }
                            >
                                {states?.map((state) => (
                                    <Select.Option
                                        value={state.id}
                                        key={state.id + "a"}
                                    >
                                        {state.id}
                                    </Select.Option>
                                ))}
                            </Select>
                        </SelectBar>
                        <AlphabetList
                            dataSource={alphabet}
                            style={{
                                gridArea: "alphabet",
                            }}
                            bordered
                            header={
                                <AlphabetListHeader>
                                    <Typography.Text>Alfabeto</Typography.Text>
                                    <Button onClick={showModalAlphabetSymbol}>
                                        Adicionar
                                    </Button>
                                    {modalAlphabetSymbolCH}
                                </AlphabetListHeader>
                            }
                            renderItem={(alphabetSymbol: string, index) => (
                                <List.Item
                                    key={index + "f"}
                                    actions={[
                                        <Button
                                            onClick={() =>
                                                deleteAlphabetSymbol(
                                                    alphabetSymbol
                                                )
                                            }
                                            danger
                                        >
                                            Deletar
                                        </Button>,
                                    ]}
                                >
                                    <List.Item.Meta title={alphabetSymbol} />
                                </List.Item>
                            )}
                        />
                    </MachineEditGrid>
                </MachineEditContent>
            </Layout>
        </>
    );
}
