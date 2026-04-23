export namespace ccarchive {
	
	export class ClaudeCodeSession {
	    key: string;
	    sessionId: string;
	    projectKey: string;
	    relativePath: string;
	    sourcePath: string;
	    sizeBytes: number;
	    messageCount: number;
	    updatedAt: string;
	
	    static createFrom(source: any = {}) {
	        return new ClaudeCodeSession(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.key = source["key"];
	        this.sessionId = source["sessionId"];
	        this.projectKey = source["projectKey"];
	        this.relativePath = source["relativePath"];
	        this.sourcePath = source["sourcePath"];
	        this.sizeBytes = source["sizeBytes"];
	        this.messageCount = source["messageCount"];
	        this.updatedAt = source["updatedAt"];
	    }
	}
	export class StorageInfo {
	    archiveRoot: string;
	    exportsRoot: string;
	    claudeProjectsDir: string;
	
	    static createFrom(source: any = {}) {
	        return new StorageInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.archiveRoot = source["archiveRoot"];
	        this.exportsRoot = source["exportsRoot"];
	        this.claudeProjectsDir = source["claudeProjectsDir"];
	    }
	}
	export class DryRunResult {
	    storage: StorageInfo;
	    plannedExportId: string;
	    plannedExportPath: string;
	    sessionCount: number;
	    totalBytes: number;
	    generatedAt: string;
	    warnings?: string[];
	
	    static createFrom(source: any = {}) {
	        return new DryRunResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.storage = this.convertValues(source["storage"], StorageInfo);
	        this.plannedExportId = source["plannedExportId"];
	        this.plannedExportPath = source["plannedExportPath"];
	        this.sessionCount = source["sessionCount"];
	        this.totalBytes = source["totalBytes"];
	        this.generatedAt = source["generatedAt"];
	        this.warnings = source["warnings"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class ExportRequest {
	    sessionKeys?: string[];
	    includeAll: boolean;
	    destinationRoot?: string;
	
	    static createFrom(source: any = {}) {
	        return new ExportRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.sessionKeys = source["sessionKeys"];
	        this.includeAll = source["includeAll"];
	        this.destinationRoot = source["destinationRoot"];
	    }
	}
	export class ExportResult {
	    storage: StorageInfo;
	    exportId: string;
	    exportPath: string;
	    manifestPath: string;
	    checksumsPath: string;
	    exportedSessions: number;
	    exportedBytes: number;
	    createdAt: string;
	    warnings?: string[];
	
	    static createFrom(source: any = {}) {
	        return new ExportResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.storage = this.convertValues(source["storage"], StorageInfo);
	        this.exportId = source["exportId"];
	        this.exportPath = source["exportPath"];
	        this.manifestPath = source["manifestPath"];
	        this.checksumsPath = source["checksumsPath"];
	        this.exportedSessions = source["exportedSessions"];
	        this.exportedBytes = source["exportedBytes"];
	        this.createdAt = source["createdAt"];
	        this.warnings = source["warnings"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class RestoreRequest {
	    exportPath: string;
	    overwrite: boolean;
	    dryRun: boolean;
	
	    static createFrom(source: any = {}) {
	        return new RestoreRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.exportPath = source["exportPath"];
	        this.overwrite = source["overwrite"];
	        this.dryRun = source["dryRun"];
	    }
	}
	export class RestoreResult {
	    storage: StorageInfo;
	    exportId: string;
	    exportPath: string;
	    dryRun: boolean;
	    plannedSessions: number;
	    restoredSessions: number;
	    skippedSessions: number;
	    restoredAt: string;
	    conflicts?: string[];
	    warnings?: string[];
	
	    static createFrom(source: any = {}) {
	        return new RestoreResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.storage = this.convertValues(source["storage"], StorageInfo);
	        this.exportId = source["exportId"];
	        this.exportPath = source["exportPath"];
	        this.dryRun = source["dryRun"];
	        this.plannedSessions = source["plannedSessions"];
	        this.restoredSessions = source["restoredSessions"];
	        this.skippedSessions = source["skippedSessions"];
	        this.restoredAt = source["restoredAt"];
	        this.conflicts = source["conflicts"];
	        this.warnings = source["warnings"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class ScanResult {
	    storage: StorageInfo;
	    sessions: ClaudeCodeSession[];
	    totalSessions: number;
	    totalBytes: number;
	    scannedAt: string;
	    warnings?: string[];
	
	    static createFrom(source: any = {}) {
	        return new ScanResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.storage = this.convertValues(source["storage"], StorageInfo);
	        this.sessions = this.convertValues(source["sessions"], ClaudeCodeSession);
	        this.totalSessions = source["totalSessions"];
	        this.totalBytes = source["totalBytes"];
	        this.scannedAt = source["scannedAt"];
	        this.warnings = source["warnings"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

