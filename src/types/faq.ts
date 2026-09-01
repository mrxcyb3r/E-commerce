export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  published?: boolean;
  is_published?: boolean;
  order?: number;
  sort_order?: number;
}
