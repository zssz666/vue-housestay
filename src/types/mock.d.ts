declare module 'mockjs' {
  export interface Mockjs {
    mock<T = any>(template: any): T;
    mock(url: string | RegExp, type: string, template: any): any;
    mock(url: string | RegExp, template: any): any;
    mock(url: string | RegExp, functionTemplate: (options: any) => any): any;
    setup(config: { timeout?: number | string }): void;
    random: {
      boolean(options?: any): boolean;
      natural(min?: number, max?: number): number;
      integer(min?: number, max?: number): number;
      float(min?: number, max?: number, dmin?: number, dmax?: number): number;
      character(pool?: string): string;
      string(pool?: string, min?: number, max?: number): string;
      range(start?: number, stop?: number, step?: number): number[];
      date(format?: string): string;
      time(format?: string): string;
      datetime(format?: string): string;
      now(unit?: string, format?: string): string;
      image(size?: string, background?: string, foreground?: string, format?: string, text?: string): string;
      color(): string;
      hex(): string;
      rgb(): string;
      rgba(): string;
      hsl(): string;
      email(domain?: string): string;
      ip(): string;
      url(protocol?: string, host?: string): string;
      domain(subDomain?: string, domain?: string): string;
      tld(): string;
      word(min?: number, max?: number): string;
      title(min?: number, max?: number): string;
      ctitle(min?: number, max?: number): string;
      first(): string;
      last(): string;
      name(middle?: boolean): string;
      cfirst(): string;
      clast(): string;
      cname(): string;
      pick<T>(arr: T[]): T;
      shuffle<T>(arr: T[]): T[];
      guid(): string;
      id(): string;
      increment(step?: number): number;
    };
  }

  const Mock: Mockjs;
  export default Mock;
}

declare module '@/mock/index' {
  const mockModule: any;
  export default mockModule;
}
