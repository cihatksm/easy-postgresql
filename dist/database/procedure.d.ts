interface ProcedureInfo {
    name: string;
    type: string;
    date: string | null;
}
interface ProcedureResult {
    status: number;
    message: string;
    data: any[] | null;
}
interface ProcedureReference {
    [key: string]: any;
}
/**
 * All functions in the procedure are defined in this class.
 *
 * @param name - The name of the procedure to be added to the procedure
 * @returns Object containing procedure methods
 */
export declare function Procedure(name?: string): {
    Execute: (reference?: ProcedureReference, useRecordsets?: boolean) => Promise<ProcedureResult>;
    Info: () => Promise<ProcedureInfo | null>;
    AllInfo: () => Promise<ProcedureInfo[] | null>;
    SimpleOutput: () => Promise<Record<string, string>>;
};
export {};
