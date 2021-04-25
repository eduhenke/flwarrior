// Import Dependencies
import { Button, PageHeader } from "antd";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import RegisteredItemsListRaw from "@components/RegisteredItemsList";
import Layout from "@layout";
import styled from "styled-components";
import IconBase from "@ant-design/icons";
import { ReactComponent as Regex } from "@assets/regex.svg";
import { useDatabase } from "@database";
import { Input } from "antd";
import { FLWarriorDBTables } from "@database/schema";
import { OrderedMap } from 'immutable';
import {
  getNewGrammar,
  GrammarDBEntry,
  GrammarType,
} from "@database/schema/grammar";
import { analyze, getExpressionFromString } from "@/lib/lexical-analyzer";


// Define Style
const GrammarsList = styled.section`
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
const RegexAvatar = styled(IconBase).attrs({ component: Regex })`
    font-size: 2em;
`;
// Define Component
export default function LexicalAnalyzer(): JSX.Element {
  const history = useHistory();
  const [rawGrammar, setRawGrammar] = useState('');
  const [sourceCode, setSourceCode] = useState('');
  const [result, setResult] = useState<[string, string][]>([]);

  const rawRules = rawGrammar
    .split('\n')
    .map(line => line.split('->').map(s => s.trim()) as [string, string])
    .filter(line => !!line);

  const rules = OrderedMap(rawRules).map(getExpressionFromString);

  const computeResult = () => {
    setResult(analyze(rules, sourceCode));
  }


  // Fetch Data
  return (
    <>
      <Layout>
        <GrammarsList>
          <PageHeader
            onBack={history.goBack}
            title="Analizador Léxico"
            extra={[
              <Button
                type="primary"
                key="button-create"
                onClick={computeResult}
              >Analizar</Button>,
            ]}
          />
          <div style={{ padding: '10px' }}>
            <Input.TextArea onChange={ev => setRawGrammar(ev.target.value)} />
          </div>
          <div style={{ padding: '10px' }}>
            <Input.TextArea onChange={ev => setSourceCode(ev.target.value)} />
          </div>
          <div>
            {
              result.map(([lexeme, token]) =>
                <>
                  <b>{lexeme}</b>
                  <p>{token}</p>
                </>
              )
            }
          </div>
        </GrammarsList>
      </Layout>
    </>
  );
}
