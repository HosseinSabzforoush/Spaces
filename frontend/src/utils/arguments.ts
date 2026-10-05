
export function parseArguments(input: string): string[] {
  const args: string[] = [];
  const pattern = /"([^"]*)"|(\S+)/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(input)) !== null) {
    args.push(match[1] !== undefined ? match[1] : match[2]);
  }
  return args;
}

export function formatArguments(args: string[]): string {
  return args.map((a) => (a === '' || /\s/.test(a) ? `"${a}"` : a)).join(' ');
}
