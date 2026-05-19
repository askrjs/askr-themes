let sink: unknown;

export function consume<T>(value: T): T {
  sink = value;
  return value;
}

export function readSink(): unknown {
  return sink;
}
