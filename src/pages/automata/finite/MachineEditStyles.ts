import { List } from "antd";
import IconBase from "@ant-design/icons";
import styled from "styled-components";
import { ReactComponent as RightArrowRaw } from "@assets/right-arrow.svg";

// Define Style
export const MachineEditContent = styled.section`
    height: 100%;
    display: flex;
    flex-direction: column;
`;
export const RulesContainer = styled.div`
    grid-area: rules;
`;
export const AlphabetList = styled(List)`
    /* Full Panel Size */
    flex-grow: 1;
`;
export const AlphabetListHeader = styled.header`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;
export const MachineEditGrid = styled.section`
    /* Full Height */
    flex-grow: 1;
    /* Align center */
    width: calc(100% - 48px);
    margin: 1.5rem auto;
    /* Display on Grid */
    display: grid;
    gap: 1rem;
    grid-template-columns: 4fr 4fr 2fr;
    grid-template-rows: 1fr 5fr 6fr;
    grid-template-areas:
        "rules rules entry"
        "rules rules states"
        "rules rules alphabet";
`;
const RuleHead = styled.section`
    display: flex;
    align-items: center;
    font-size: 1.8em;
`;
const RuleBody = styled.section`
    flex-grow: 1;
    text-align: left;
    font-size: 1.5rem;
`;
const RightArrow = styled(IconBase).attrs({ component: RightArrowRaw })`
    margin: auto 1rem;
`;
export const NewTransitionModaContent = styled.section`
    display: grid;
    column-gap: 1rem;

    grid-template-rows: 1fr 1fr;
    grid-template-columns: repeat(3, 1fr);
`;
export const SelectBar = styled.section`
    display: flex;
    flex-direction: column;
`;
