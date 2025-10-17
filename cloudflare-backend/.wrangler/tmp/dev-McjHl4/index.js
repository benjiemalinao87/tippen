var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// .wrangler/tmp/bundle-AhY2Se/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
__name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target, thisArg, [
      stripCfConnectingIPHeader.apply(null, argArray)
    ]);
  }
});

// node_modules/unenv/dist/runtime/_internal/utils.mjs
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
__name(PerformanceEntry, "PerformanceEntry");
var PerformanceMark = /* @__PURE__ */ __name(class PerformanceMark2 extends PerformanceEntry {
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
}, "PerformanceMark");
var PerformanceMeasure = class extends PerformanceEntry {
  entryType = "measure";
};
__name(PerformanceMeasure, "PerformanceMeasure");
var PerformanceResourceTiming = class extends PerformanceEntry {
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
__name(PerformanceResourceTiming, "PerformanceResourceTiming");
var PerformanceObserverEntryList = class {
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
__name(PerformanceObserverEntryList, "PerformanceObserverEntryList");
var Performance = class {
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
__name(Performance, "Performance");
var PerformanceObserver = class {
  __unenv__ = true;
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
__name(PerformanceObserver, "PerformanceObserver");
__publicField(PerformanceObserver, "supportedEntryTypes", []);
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {
}, { __unenv__: true });

// node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint") });

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
import { Socket } from "node:net";
var ReadStream = class extends Socket {
  fd;
  constructor(fd) {
    super();
    this.fd = fd;
  }
  isRaw = false;
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
  isTTY = false;
};
__name(ReadStream, "ReadStream");

// node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
import { Socket as Socket2 } from "node:net";
var WriteStream = class extends Socket2 {
  fd;
  constructor(fd) {
    super();
    this.fd = fd;
  }
  clearLine(dir3, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count3, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  columns = 80;
  rows = 24;
  isTTY = false;
};
__name(WriteStream, "WriteStream");

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class extends EventEmitter {
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return "";
  }
  get versions() {
    return {};
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  ref() {
  }
  unref() {
  }
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: () => 0 });
  mainModule = void 0;
  domain = void 0;
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};
__name(Process, "Process");

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var { exit, platform, nextTick } = getBuiltinModule(
  "node:process"
);
var unenvProcess = new Process({
  env: globalProcess.env,
  hrtime,
  nextTick
});
var {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  finalization,
  features,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  on,
  off,
  once,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
} = unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// src/VisitorCoordinator.ts
var VisitorCoordinator = class {
  state;
  visitors;
  visitorSockets;
  // Map visitor IDs to their WebSocket connections
  constructor(state) {
    this.state = state;
    this.visitors = /* @__PURE__ */ new Map();
    this.visitorSockets = /* @__PURE__ */ new Map();
    this.state.blockConcurrencyWhile(async () => {
      const stored = await this.state.storage.get("visitors");
      if (stored) {
        this.visitors = new Map(stored);
      }
      const currentAlarm = await this.state.storage.getAlarm();
      if (currentAlarm === null) {
        console.log("[VisitorCoordinator] Starting cleanup alarm (runs every 30 seconds)");
        await this.state.storage.setAlarm(Date.now() + 30 * 1e3);
      }
    });
  }
  async fetch(request) {
    const url = new URL(request.url);
    if (request.headers.get("Upgrade") === "websocket") {
      return this.handleWebSocketUpgrade(request);
    }
    if (request.method === "POST") {
      return this.handleMessage(request);
    }
    return new Response("VisitorCoordinator", { status: 200 });
  }
  /**
   * Handle WebSocket upgrade from admin dashboard or visitor
   */
  handleWebSocketUpgrade(request) {
    const url = new URL(request.url);
    const connectionType = url.searchParams.get("connectionType") || "dashboard";
    const visitorId = url.searchParams.get("visitorId");
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.state.acceptWebSocket(server);
    if (connectionType === "visitor" && visitorId) {
      console.log("[VisitorCoordinator] New visitor WebSocket connection:", visitorId);
      server.serializeAttachment({
        connectedAt: Date.now(),
        type: "visitor",
        visitorId
      });
      this.visitorSockets.set(visitorId, server);
      server.send(JSON.stringify({
        type: "CONNECTED",
        visitorId
      }));
    } else {
      console.log("[VisitorCoordinator] New dashboard connection, current visitors:", this.visitors.size);
      server.serializeAttachment({
        connectedAt: Date.now(),
        type: "dashboard"
      });
      const visitorList = Array.from(this.visitors.values());
      console.log("[VisitorCoordinator] Sending INITIAL_VISITORS:", visitorList.length, "visitors");
      server.send(JSON.stringify({
        type: "INITIAL_VISITORS",
        visitors: visitorList
      }));
    }
    return new Response(null, {
      status: 101,
      webSocket: client
    });
  }
  /**
   * Handle incoming messages (visitor tracking, video invites)
   */
  async handleMessage(request) {
    try {
      const data = await request.json();
      if (data.type === "NEW_VISITOR") {
        await this.handleNewVisitor(data.visitor, data.event, data.website);
      } else if (data.type === "SEND_VIDEO_INVITE") {
        await this.handleSendVideoInvite(data.visitorId, data.guestUrl);
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error3) {
      return new Response(JSON.stringify({ error: error3.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
  /**
   * Handle new visitor event
   */
  async handleNewVisitor(visitor, event, website) {
    const visitorId = visitor.visitorId;
    console.log("[VisitorCoordinator] New visitor event:", visitorId, visitor.company);
    if (this.visitors.has(visitorId)) {
      const existing = this.visitors.get(visitorId);
      existing.lastActivity = visitor.timestamp;
      existing.pageViews = (existing.pageViews || 1) + 1;
      this.visitors.set(visitorId, existing);
    } else {
      this.visitors.set(visitorId, {
        ...visitor,
        website,
        lastActivity: visitor.timestamp,
        pageViews: 1,
        status: "active"
      });
    }
    await this.state.storage.put("visitors", Array.from(this.visitors.entries()));
    this.broadcastToAll({
      type: "VISITOR_UPDATE",
      visitor: this.visitors.get(visitorId),
      event
    });
  }
  /**
   * Handle sending video invite to visitor
   */
  async handleSendVideoInvite(visitorId, guestUrl) {
    const visitor = this.visitors.get(visitorId);
    if (!visitor) {
      throw new Error("Visitor not found");
    }
    visitor.status = "video_invited";
    visitor.guestUrl = guestUrl;
    this.visitors.set(visitorId, visitor);
    await this.state.storage.put("visitors", Array.from(this.visitors.entries()));
    const visitorSocket = this.visitorSockets.get(visitorId);
    if (visitorSocket) {
      console.log("[VisitorCoordinator] Sending VIDEO_INVITE to visitor:", visitorId);
      try {
        visitorSocket.send(JSON.stringify({
          type: "VIDEO_INVITE",
          guestUrl,
          visitorId
        }));
      } catch (error3) {
        console.error("[VisitorCoordinator] Error sending video invite to visitor:", error3);
      }
    } else {
      console.log("[VisitorCoordinator] Visitor WebSocket not connected:", visitorId);
    }
    this.broadcastToDashboards({
      type: "VIDEO_INVITE_SENT",
      visitorId,
      guestUrl
    });
  }
  /**
   * WebSocket Hibernation API: Handle incoming WebSocket messages
   */
  webSocketMessage(ws, message) {
    try {
      const data = JSON.parse(message);
      console.log("[VisitorCoordinator] WebSocket message:", data.type);
      if (data.type === "PING") {
        ws.send(JSON.stringify({ type: "PONG", timestamp: Date.now() }));
      }
      if (data.type === "GET_VISITORS") {
        const visitorList = Array.from(this.visitors.values());
        console.log("[VisitorCoordinator] Sending VISITOR_LIST:", visitorList.length, "visitors");
        ws.send(JSON.stringify({
          type: "VISITOR_LIST",
          visitors: visitorList
        }));
      }
    } catch (error3) {
      console.error("[VisitorCoordinator] WebSocket message error:", error3);
    }
  }
  /**
   * WebSocket Hibernation API: Handle WebSocket close
   */
  webSocketClose(ws, code, reason, wasClean) {
    console.log("WebSocket closed:", { code, reason, wasClean });
    const attachment = ws.deserializeAttachment();
    if (attachment && attachment.type === "visitor" && attachment.visitorId) {
      console.log("[VisitorCoordinator] Removing visitor WebSocket:", attachment.visitorId);
      this.visitorSockets.delete(attachment.visitorId);
    }
    const activeSockets = this.state.getWebSockets();
    console.log("Active WebSocket connections remaining:", activeSockets.length);
    if (activeSockets.length === 0) {
      console.log("No more active connections, can pause updates");
    }
  }
  /**
   * WebSocket Hibernation API: Handle WebSocket error
   */
  webSocketError(ws, error3) {
    console.error("WebSocket error:", error3);
  }
  /**
   * Broadcast message to all connected dashboards
   */
  broadcastToAll(message) {
    const sockets = this.state.getWebSockets();
    sockets.forEach((ws) => {
      try {
        ws.send(JSON.stringify(message));
      } catch (error3) {
        console.error("Broadcast error:", error3);
      }
    });
  }
  /**
   * Broadcast message only to dashboard connections
   */
  broadcastToDashboards(message) {
    const sockets = this.state.getWebSockets();
    sockets.forEach((ws) => {
      try {
        const attachment = ws.deserializeAttachment();
        if (attachment && attachment.type === "dashboard") {
          ws.send(JSON.stringify(message));
        }
      } catch (error3) {
        console.error("Broadcast error:", error3);
      }
    });
  }
  /**
   * Alarm handler for cleanup
   * Removes inactive visitors after 1 minute (visitors who left the site)
   */
  async alarm() {
    const now = Date.now();
    const oneMinute = 60 * 1e3;
    let removedCount = 0;
    console.log("[VisitorCoordinator] Running cleanup alarm, checking", this.visitors.size, "visitors");
    for (const [visitorId, visitor] of this.visitors.entries()) {
      const lastActivity = new Date(visitor.lastActivity).getTime();
      const inactiveTime = now - lastActivity;
      if (inactiveTime > oneMinute) {
        console.log("[VisitorCoordinator] Removing inactive visitor:", visitor.company, "inactive for", Math.round(inactiveTime / 1e3), "seconds");
        this.visitors.delete(visitorId);
        removedCount++;
      }
    }
    if (removedCount > 0) {
      console.log("[VisitorCoordinator] Removed", removedCount, "inactive visitors");
      this.broadcastToAll({
        type: "VISITOR_LIST",
        visitors: Array.from(this.visitors.values())
      });
    }
    await this.state.storage.put("visitors", Array.from(this.visitors.entries()));
    const activeSockets = this.state.getWebSockets();
    if (activeSockets.length > 0 || this.visitors.size > 0) {
      console.log("[VisitorCoordinator] Rescheduling alarm - Active connections:", activeSockets.length, "Visitors:", this.visitors.size);
      await this.state.storage.setAlarm(Date.now() + 30 * 1e3);
    } else {
      console.log("[VisitorCoordinator] No active connections or visitors - stopping alarm");
    }
  }
};
__name(VisitorCoordinator, "VisitorCoordinator");

// src/index.ts
var src_default = {
  async fetch(request, env2) {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Tippen-API-Key"
    };
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    if (url.pathname === "/track/visitor" && request.method === "POST") {
      return handleVisitorTracking(request, env2, corsHeaders);
    }
    if (url.pathname === "/ws/dashboard") {
      return handleWebSocketConnection(request, env2, "dashboard");
    }
    if (url.pathname === "/ws/visitor") {
      return handleWebSocketConnection(request, env2, "visitor");
    }
    if (url.pathname === "/api/send-video-invite" && request.method === "POST") {
      return handleSendVideoInvite(request, env2, corsHeaders);
    }
    return new Response("Tippen API", { status: 200 });
  }
};
async function handleVisitorTracking(request, env2, corsHeaders) {
  try {
    const data = await request.json();
    const apiKey = request.headers.get("X-Tippen-API-Key");
    if (!apiKey) {
      return new Response("API key required", { status: 401, headers: corsHeaders });
    }
    const enrichedVisitor = await enrichVisitorData(data.visitor, request, env2);
    console.log("[Tippen] Enriched visitor:", JSON.stringify({
      company: enrichedVisitor.company,
      location: enrichedVisitor.location,
      lastRole: enrichedVisitor.lastRole,
      userAgent: enrichedVisitor.userAgent?.substring(0, 50) + "..."
    }));
    const id = env2.VISITOR_COORDINATOR.idFromName(apiKey);
    const stub = env2.VISITOR_COORDINATOR.get(id);
    await stub.fetch(request.url, {
      method: "POST",
      body: JSON.stringify({
        type: "NEW_VISITOR",
        visitor: enrichedVisitor,
        event: data.event,
        website: data.website
      })
    });
    return new Response(
      JSON.stringify({
        success: true,
        sessionId: enrichedVisitor.visitorId
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error3) {
    return new Response(
      JSON.stringify({ error: error3.message }),
      { status: 500, headers: corsHeaders }
    );
  }
}
__name(handleVisitorTracking, "handleVisitorTracking");
async function enrichVisitorData(visitor, request, env2) {
  const ip = request.headers.get("CF-Connecting-IP") || "";
  try {
    const response = await fetch(`https://company.clearbit.com/v1/domains/find?ip=${ip}`, {
      headers: {
        Authorization: `Bearer ${env2.CLEARBIT_API_KEY}`
      }
    });
    if (response.ok) {
      const companyData = await response.json();
      return {
        ...visitor,
        ip,
        company: companyData.name || "Unknown",
        revenue: companyData.metrics?.estimatedAnnualRevenue || null,
        staff: companyData.metrics?.employees || null,
        industry: companyData.category?.industry || null,
        domain: companyData.domain || null
      };
    }
  } catch (error3) {
    console.error("Enrichment failed:", error3);
  }
  let companyName = "Direct Visitor";
  if (visitor.referrer && visitor.referrer !== "direct") {
    try {
      const referrerUrl = new URL(visitor.referrer);
      companyName = referrerUrl.hostname.replace("www.", "");
    } catch (e) {
    }
  } else if (visitor.url) {
    try {
      const urlObj = new URL(visitor.url);
      companyName = urlObj.hostname.replace("www.", "") + " Visitor";
    } catch (e) {
    }
  }
  const ua = visitor.userAgent || "";
  let deviceInfo = "Unknown Device";
  if (ua.includes("iPhone"))
    deviceInfo = "iPhone";
  else if (ua.includes("iPad"))
    deviceInfo = "iPad";
  else if (ua.includes("Android"))
    deviceInfo = "Android";
  else if (ua.includes("Mac"))
    deviceInfo = "Mac";
  else if (ua.includes("Windows"))
    deviceInfo = "Windows";
  else if (ua.includes("Linux"))
    deviceInfo = "Linux";
  let browser = "Unknown Browser";
  if (ua.includes("Chrome") && !ua.includes("Edg"))
    browser = "Chrome";
  else if (ua.includes("Safari") && !ua.includes("Chrome"))
    browser = "Safari";
  else if (ua.includes("Firefox"))
    browser = "Firefox";
  else if (ua.includes("Edg"))
    browser = "Edge";
  return {
    ...visitor,
    ip,
    company: companyName,
    location: visitor.timezone || "Unknown Location",
    lastRole: `${deviceInfo} - ${browser}`,
    revenue: null,
    staff: null,
    userAgent: visitor.userAgent,
    screenResolution: visitor.screenResolution,
    language: visitor.language
  };
}
__name(enrichVisitorData, "enrichVisitorData");
async function handleWebSocketConnection(request, env2, connectionType) {
  const url = new URL(request.url);
  const apiKey = url.searchParams.get("apiKey");
  if (!apiKey) {
    return new Response("API key required", { status: 401 });
  }
  const id = env2.VISITOR_COORDINATOR.idFromName(apiKey);
  const stub = env2.VISITOR_COORDINATOR.get(id);
  const newUrl = new URL(request.url);
  newUrl.searchParams.set("connectionType", connectionType);
  if (connectionType === "visitor") {
    const visitorId = url.searchParams.get("visitorId");
    if (visitorId) {
      newUrl.searchParams.set("visitorId", visitorId);
    }
  }
  return stub.fetch(newUrl.toString(), {
    method: request.method,
    headers: request.headers
  });
}
__name(handleWebSocketConnection, "handleWebSocketConnection");
async function handleSendVideoInvite(request, env2, corsHeaders) {
  try {
    const data = await request.json();
    const { apiKey, visitorId, guestUrl } = data;
    const id = env2.VISITOR_COORDINATOR.idFromName(apiKey);
    const stub = env2.VISITOR_COORDINATOR.get(id);
    await stub.fetch(request.url, {
      method: "POST",
      body: JSON.stringify({
        type: "SEND_VIDEO_INVITE",
        visitorId,
        guestUrl
      })
    });
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error3) {
    return new Response(
      JSON.stringify({ error: error3.message }),
      { status: 500, headers: corsHeaders }
    );
  }
}
__name(handleSendVideoInvite, "handleSendVideoInvite");

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } catch (e) {
    const error3 = reduceError(e);
    return Response.json(error3, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-AhY2Se/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env2, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env2, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env2, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env2, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-AhY2Se/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__, "__Facade_ScheduledController__");
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env2, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env2, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env2, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env2, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env2, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env2, ctx) => {
      this.env = env2;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  VisitorCoordinator,
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
