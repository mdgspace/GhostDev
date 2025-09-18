export interface MyCustomType {
    id: number;
    name: string;
    isActive: boolean;
}

export type MyCustomArrayType = MyCustomType[];

export interface Config {
    settingA: string;
    settingB: number;
    settingC: boolean;
}