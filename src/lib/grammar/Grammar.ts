import Immutable from "immutable";
import { GrammarType, GrammarDBEntry } from "../../database/schema/grammar";
import { IAlphabet } from "../Alphabet";
import { ASymbol, EPSILON } from "../AlphabetSymbol";

// Immutability Port
export type IGrammarWord = Immutable.List<ASymbol>;
type ProductionRules = Immutable.Map<IGrammarWord, Immutable.Set<IGrammarWord>>;
export interface IGrammar {
    id: string;
    name: string;
    type: GrammarType;
    startSymbol: ASymbol;
    terminalSymbols: IAlphabet;
    nonTerminalSymbols: IAlphabet;
    productionRules: ProductionRules;
}
export type IIGrammar = Immutable.Map<keyof IGrammar, IGrammar[keyof IGrammar]>;

export const rename = (grammar: IIGrammar, newName: string): IIGrammar =>
    grammar.update("name", () => newName);

export const addNonTerminalSymbol = (
    grammar: IIGrammar,
    symbol: ASymbol
): IIGrammar =>
    grammar.update(
        "nonTerminalSymbols",
        Immutable.OrderedSet<ASymbol>(),
        (old: Immutable.OrderedSet<ASymbol>) => old.union([symbol])
    );

export const addTerminalSymbol = (
    grammar: IIGrammar,
    symbol: ASymbol
): IIGrammar =>
    grammar.update(
        "terminalSymbols",
        Immutable.OrderedSet<ASymbol>(),
        (old: Immutable.OrderedSet<ASymbol>) => old.union([symbol])
    );

export const removeTerminalSymbol = (
    grammar: IIGrammar,
    terminalSymbol: ASymbol
): IIGrammar =>
    grammar.update(
        "terminalSymbols",
        Immutable.OrderedSet<ASymbol>(),
        (old: Immutable.OrderedSet<ASymbol>) => old.remove(terminalSymbol)
    );

export const removeNonTerminalSymbol = (
    grammar: IIGrammar,
    nonTerminalSymbol: ASymbol
): IIGrammar =>
    grammar.update(
        "nonTerminalSymbols",
        Immutable.OrderedSet<ASymbol>(),
        (old: Immutable.OrderedSet<ASymbol>) => old.remove(nonTerminalSymbol)
    );

export const addProductionHead = (
    grammar: IIGrammar,
    from: Array<ASymbol>
): IIGrammar =>
    grammar.update(
        "productionRules",
        Immutable.Map<IGrammarWord, Immutable.Set<IGrammarWord>>(),
        (rules: Immutable.Map<IGrammarWord, Immutable.Set<IGrammarWord>>) =>
            rules.has(Immutable.List(from))
                ? rules
                : rules.set(Immutable.List(from), Immutable.Set())
    );

export const addProductionBody = (
    grammar: IIGrammar,
    from: Array<ASymbol>,
    to: Array<ASymbol>
): IIGrammar =>
    grammar.updateIn(
        ["productionRules", Immutable.List(from)],
        Immutable.Set<IGrammarWord>(),
        (old: Immutable.Set<IGrammarWord>) =>
            old.has(Immutable.List(to)) ? old : old.add(Immutable.List(to))
    );

export const removeProductionHead = (
    grammar: IIGrammar,
    from: Array<ASymbol>
): IIGrammar =>
    grammar.update(
        "productionRules",
        (old: Immutable.Map<IGrammarWord, Immutable.Set<IGrammarWord>>) =>
            old.remove(Immutable.List(from))
    );

export const removeProductionBody = (
    grammar: IIGrammar,
    from: Array<ASymbol>,
    body: Array<ASymbol>
): IIGrammar =>
    grammar.updateIn(
        ["productionRules", Immutable.List(from)],
        (old: Immutable.Set<IGrammarWord>) => old.remove(Immutable.List(body))
    );

export const setStartSymbol = (
    grammar: IIGrammar,
    newStartSymbol: ASymbol
): IIGrammar => grammar.update("startSymbol", () => newStartSymbol);

export const checkOwnType = (grammar: IIGrammar): GrammarType => {
    // Check for type Context Sensitive (No recursive empty)
    if (
        !(grammar.get("productionRules") as IGrammar["productionRules"]).every(
            (bodies, head, rules) => {
                // Check if Initial States
                if (
                    head.join() ===
                    (grammar.get("startSymbol") as IGrammar["startSymbol"])
                ) {
                    // Check Initial State Rules
                    if (head.includes(EPSILON)) {
                        // Check Head is not target of any production
                        return rules.every(
                            (nestedBodies, nestedHead) =>
                                !nestedHead.equals(head) ||
                                nestedBodies.every((nestedBody) =>
                                    nestedBody.join().includes(head.join())
                                )
                        );
                    }
                    // Only Check Size
                    return bodies.every(
                        (body) =>
                            head.size <= body.size && !body.includes(EPSILON)
                    );
                }
                // Check Normal Body
                return bodies.every(
                    (body) => head.size <= body.size && !body.includes(EPSILON)
                );
            }
        )
    ) {
        return GrammarType.UNRESTRICTED;
    }
    // Check for type Context Free (Head with length === 1)
    if (
        !(grammar.get("productionRules") as IGrammar["productionRules"]).every(
            (_, head) => head.size === 1
        )
    ) {
        return GrammarType.CONTEXT_SENSITIVE;
    }
    // Check for type Finite State
    if (
        !(grammar.get(
            "productionRules"
        ) as IGrammar["productionRules"]).every((body) =>
            body.every(
                (pb) =>
                    [1, 2].includes(pb.size) &&
                    (grammar.get(
                        "terminalSymbols"
                    ) as IGrammar["terminalSymbols"]).includes(pb.get(0)) &&
                    (pb.size === 1 ||
                        (grammar.get(
                            "nonTerminalSymbols"
                        ) as IGrammar["nonTerminalSymbols"]).includes(
                            pb.get(1)
                        ))
            )
        )
    ) {
        return GrammarType.CONTEXT_FREE;
    }
    return GrammarType.REGULAR;
};

export const fromDBEntry = (dbEntry: GrammarDBEntry): IIGrammar =>
    Immutable.Map<IGrammar[keyof IGrammar]>({
        id: dbEntry.id,
        name: dbEntry.name,
        type: dbEntry.type,
        startSymbol: dbEntry.startSymbol,
        terminalSymbols: Immutable.OrderedSet(dbEntry.alphabetT),
        nonTerminalSymbols: Immutable.OrderedSet(dbEntry.alphabetNT),
        productionRules: dbEntry.transitions.reduce((m, c) => {
            const head = Immutable.List(c.from);
            const body = Immutable.Set(
                c.to.map((prod) => Immutable.List(prod))
            );
            return m.set(
                head,
                m.get(head, Immutable.Set<IGrammarWord>()).merge(body)
            );
        }, Immutable.Map<IGrammarWord, Immutable.Set<IGrammarWord>>()),
    }) as IIGrammar;

export const toDBEntry = (grammar: IIGrammar): GrammarDBEntry => {
    // Fetch Type of Grammar
    const grammarType = checkOwnType(grammar);

    return {
        id: grammar.get("id") as string,
        name: grammar.get("name") as string,
        type: grammarType,
        startSymbol: grammar.get("startSymbol") as string,
        alphabetT: (grammar.get(
            "terminalSymbols"
        ) as IGrammar["terminalSymbols"]).toArray(),
        alphabetNT: (grammar.get(
            "nonTerminalSymbols"
        ) as IGrammar["nonTerminalSymbols"]).toArray(),
        transitions: (grammar.get(
            "productionRules"
        ) as IGrammar["productionRules"])
            .entrySeq()
            .map(([head, bodies]) => ({ from: head, to: bodies }))
            .toJS() as GrammarDBEntry["transitions"],
    } as GrammarDBEntry;
};

const longestCommonPrefix = (strs: string[]): string => {
    let smallest = strs.reduce((min, str) => min < str ? min : str);
    let largest = strs.reduce((min, str) => min > str ? min : str);

    console.log(smallest, largest);
    for (let i = 0; i < smallest.length; i++) {
        if (smallest[i] != largest[i])
            return smallest.substr(0, i);
    }

    return '';
};

// export const removeDirectNonDeterminism = (grammar: IIGrammar): IIGrammar => {
//     const productionRules = grammar.get('productionRules') as ProductionRules;
//     // productionRules.map((rules, nonTerminalSymbol) => {
//     //     rules.
//     // })
//     // productionRules.forEach((body, head) => {
//     //     const headSymbol = head.get(0);
//     // });
//     const prefixes = productionRules.map((body, head) => {
//         if (head.size > 1)
//             throw new Error('rules with more than one symbol in the head not allowed');
//         return longestCommonPrefix(body);
//     }).filter(prefix => prefix.length > 0);

//     for (const [head, prefix] of prefixes.entries()) {
//         grammar = grammar.updateIn(
//             ["productionRules", Immutable.List(head)],
//             (old: Immutable.Set<IGrammarWord>) => old.map(word => word.takeWhile((symbol, i) => symbol === prefix[i]))//remove(Immutable.List(body))
//         );
//         // addProductionBody(grammar, [head+'\''], )
//     }
//     return grammar;
// }

export const convertRulesToJS = (rules: ProductionRules): Record<string, string[]> =>
    rules.toMap().mapKeys(head => head.toArray().join('')).map(body => body.toArray().map(symbols => symbols.join(''))).toJS() as Record<string, string[]>;

export const convertRulesFromJS = (jsRules: Record<string, string[]>): ProductionRules =>
    Immutable.Map(Object.entries(jsRules).map(([head, body]) =>
        [Immutable.List(head.split('')), Immutable.Set(body.map(symbols => Immutable.List(symbols.split(''))))]
    ));

export const removeDirectNonDeterminism = (grammar: IIGrammar): IIGrammar => {
    const productionRules = grammar.get('productionRules') as ProductionRules;
    const rules = convertRulesToJS(productionRules);
    console.log(productionRules, convertRulesFromJS(rules));
    console.log(rules);
    const prefixes = Object
        .entries(rules)
        .map(([head, body]) => [head, longestCommonPrefix(body)])
        .filter(([_, prefix]) => prefix.length > 0);

    for (const [head, body] of Object.entries(rules)) {
        const prefix = longestCommonPrefix(body);
        const entries = body.map(word => word.startsWith(prefix) ? [prefix, word.replace(prefix, '')] : [word, '']);
        const updatedBody = entries.map(s => s[0]);
        const newBody = entries.map(s => s[1]);
        const newHead = head + "'";
        if (updatedBody.some(word => word.length)) {
            rules[head] = [...new Set(updatedBody)].map(x => x + newHead);
            rules[newHead] = newBody;
            grammar = addProductionHead(grammar, [head, "'"]);
        }
    }

    console.log({ rules });
    return grammar.update('productionRules', () => convertRulesFromJS(rules));
}

// export const leftFactor = (grammar: IIGrammar): IIGrammar => {
// }