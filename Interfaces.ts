/* eslint-disable no-unused-vars */

export interface YamlStructure {
    vars: object
    structure: FsResource
}

export interface FsResource {
    name: string;
    type: FsResourceType;
    children?: FsResource[];
    generateChildren?: FsResource[];
    list?: string
}

export interface Directory extends FsResource {
    children: FsResource[];
}

export const enum FsResourceType {
    FILE = 'file',
    DIRECTORY = 'directory'
}

export interface Check {
    name: string;
    result: boolean;
}

export interface ResourceCheckResult {
    name: string,
    level: number,
    checks: Check[],
    children?: ResourceCheckResult[],
}
