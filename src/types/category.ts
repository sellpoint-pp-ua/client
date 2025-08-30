export type Category = {
  id: string;
  name: string;
  children?: Category[];
}; 