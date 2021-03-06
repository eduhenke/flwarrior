export interface IState {
    id: string;
    isEntry: boolean;
    isExit: boolean;
}

export default class State implements IState {
    #id: string;

    #isEntry: boolean;

    #isExit: boolean;

    constructor(id: string, isEntry: boolean, isExit: boolean) {
        this.#id = id;
        this.#isEntry = isEntry;
        this.#isExit = isExit;
    }

    get id(): string {
        return this.#id;
    }

    set id(id: string) {
        this.#id = id;
    }

    set isEntry(isEntry: boolean) {
        this.#isEntry = isEntry;
    }

    get isEntry(): boolean {
        return this.#isEntry;
    }

    set isExit(isExit: boolean) {
        this.#isExit = isExit;
    }

    get isExit(): boolean {
        return this.#isExit;
    }

    equals(that: State): boolean {
        return this.#id === that.id;
    }
}
