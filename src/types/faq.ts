export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  published?: boolean;
  order?: number;
}
