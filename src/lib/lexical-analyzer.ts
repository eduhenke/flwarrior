
import { IGrammar } from '@/lib/grammar/Grammar';
import { Map, OrderedMap } from 'immutable';
import { convertRegularExpressionToNonDeterministicFiniteMachine } from '@/lib/conversion';
import { determinize, union } from './automaton/Machine';
import { IIMachine, nextStep } from '@/lib/automaton/Machine';
import { ExpressionType, getNewExpression } from '@/database/schema/expression';
import { setExpression, fromDBEntry, IIRegex } from './expressions/Regex';

/** key is the rule name and the value is it's regex */
export type Rules<Token extends string> = OrderedMap<Token, IIRegex>;

type Lexeme = string;


export const accepts = (machine: IIMachine, word: string): boolean =>
  word.length === [...nextStep(machine, word)].length;

export const getExpressionFromString = (expression: string): IIRegex =>
  setExpression(fromDBEntry(getNewExpression(ExpressionType.REGULAR)), expression as string);

export const analyze = <Token extends string>(rules: Rules<Token>, sourceCode: string): Array<[Lexeme, Token]> => {
  const lexemes: Lexeme[] = sourceCode
    .replace(/\n/g, " ")
    // TODO:
    .split(" ")
    .filter((str) => !!str);

  const machines = rules
    .map(convertRegularExpressionToNonDeterministicFiniteMachine)
    .map(determinize);

  let result: Array<[Lexeme, Token]> = [];

  for (const lexeme of lexemes) {
    for (const [token, machine] of machines.entries()) {
      const accepted = accepts(machine, lexeme);
      // console.log('checking if machine accepts', { lexeme, token, accepted, machine: machine.toJS() })
      if (accepted) {
        result.push([lexeme, token]);
        // TODO: what if there's more than one possible token?
        break;
      }
    }
  }
  return result;
}