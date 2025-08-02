export type Category = {
  id: string;
  name: Record<string, string>;
  children?: Category[];
}; 