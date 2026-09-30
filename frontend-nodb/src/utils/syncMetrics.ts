export interface SyncMetricsData {
  filesListRequests: number;
  readRangeRequests: number;
  filesParsed: number;
  filesSkipped: number;
  parseErrors: number;
  startTime: number;
  endTime?: number;
  durationMs?: number;
}

class SyncMetricsManager {
  private currentMetrics: SyncMetricsData = {
    filesListRequests: 0,
    readRangeRequests: 0,
    filesParsed: 0,
    filesSkipped: 0,
    parseErrors: 0,
    startTime: Date.now(),
  };

  public reset() {
    this.currentMetrics = {
      filesListRequests: 0,
      readRangeRequests: 0,
      filesParsed: 0,
      filesSkipped: 0,
      parseErrors: 0,
      startTime: Date.now(),
    };
  }

  public recordFilesListRequest() {
    this.currentMetrics.filesListRequests++;
  }

  public recordReadRangeRequest() {
    this.currentMetrics.readRangeRequests++;
  }

  public recordFileParsed() {
    this.currentMetrics.filesParsed++;
  }

  public recordFileSkipped() {
    this.currentMetrics.filesSkipped++;
  }

  public recordParseError() {
    this.currentMetrics.parseErrors++;
  }

  public finish(): SyncMetricsData {
    this.currentMetrics.endTime = Date.now();
    this.currentMetrics.durationMs = this.currentMetrics.endTime - this.currentMetrics.startTime;
    console.log(
      `%c[SyncMetrics] Complete in ${this.currentMetrics.durationMs}ms | listFiles: ${this.currentMetrics.filesListRequests} | readRange: ${this.currentMetrics.readRangeRequests} | parsed: ${this.currentMetrics.filesParsed} | skipped: ${this.currentMetrics.filesSkipped} | errors: ${this.currentMetrics.parseErrors}`,
      'color: #10B981; font-weight: bold;'
    );
    return { ...this.currentMetrics };
  }

  public getMetrics(): SyncMetricsData {
    return { ...this.currentMetrics };
  }
}

export const syncMetrics = new SyncMetricsManager();
