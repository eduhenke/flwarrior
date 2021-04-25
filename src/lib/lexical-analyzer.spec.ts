
import { analyze, getExpressionFromString } from './lexical-analyzer';
import { OrderedMap } from 'immutable';

const lowerAlphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
const upperAlphabet = lowerAlphabet.map(c => c.toUpperCase());
const numbers = '0123456789'.split('');
const alphabet = lowerAlphabet.concat(upperAlphabet);
const alphaNumeric = alphabet.concat(numbers);


const rules = OrderedMap({
  if: 'if',
  type: '(int|double|float)',
  identifier: `(${alphabet.join('|')})(${alphaNumeric.join('|')})*`,
  openparen: '\\(',
  closeparen: '\\)',
  openblock: '{',
  closeblock: '}',
  semicolon: ';',
  literal: `(${numbers.join('|')})*`,
}).map(getExpressionFromString);

console.log(rules.toJS());

test('analyzes correctly', () => {
  expect(analyze(rules, 'if')).toMatchObject([
    ['if', 'if']
  ]);
  expect(analyze(rules, 'int a')).toMatchObject([
    ['int', 'type'],
    ['a', 'identifier'],
  ]);
  //   expect(analyze(rules, `
  // int a () {
  //   printf(2021);
  // }`)).toMatchObject([
  //     ['int', 'type'],
  //     ['a', 'identifier'],
  //     ['(', 'openparen'],
  //     [')', 'closeparen'],
  //     ['{', 'openblock'],
  //     ['printf', 'identifier'],
  //     ['(', 'openparen'],
  //     ['2021', 'literal'],
  //     [')', 'closeparen'],
  //     ['}', 'closeblock'],
  //   ]);
})