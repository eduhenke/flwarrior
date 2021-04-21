
import { analyze, Rules } from './lexycal-analyzer';
import { getNewGrammar } from '@/database/schema/grammar';
import { GrammarType } from '@/database/schema/grammar';
import { Map } from 'immutable';
import { ExpressionType, getNewExpression } from '@/database/schema/expression';
import { setExpression, fromDBEntry, IIRegex } from './expressions/Regex';

const lowerAlphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
const upperAlphabet = lowerAlphabet.map(c => c.toUpperCase());
const numbers = '0123456789'.split('');
const alphabet = lowerAlphabet.concat(upperAlphabet);
const alphaNumeric = alphabet.concat(numbers);

const createRules = <Token extends string>(labeledExpressions: Record<Token, string>): Rules<Token> =>
  Map(
    Object.fromEntries(
      Object
        .entries(labeledExpressions)
        .map(
          ([key, value]) =>
            [
              key as any as Token,
              setExpression(fromDBEntry(getNewExpression(ExpressionType.REGULAR)), value as string)
            ]
        )
    )
  ) as Rules<Token>;

const rules = createRules({
  if: 'if',
  type: '(int|double|float)',
  identifier: `(${alphabet.join('|')})`,
  openparen: '\\(',
  closeparen: '\\)',
  openblock: '{',
  closeblock: '}',
  literal: `(${numbers.join('|')})*`,
})

test('analyzes correctly', () => {
  expect(analyze(rules, 'if')).toMatchObject([
    ['if', 'if']
  ]);
  expect(analyze(rules, 'int a')).toMatchObject([
    ['int', 'type'],
    ['a', 'identifier'],
  ]);
  expect(analyze(rules, `
int a ( ) {
  printf ( 2021 ) ;
}`)).toMatchObject([
    ['int', 'type'],
    ['a', 'identifier'],
    ['(', 'openparen'],
  ]);
})