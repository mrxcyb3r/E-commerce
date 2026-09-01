export interface Review {
  id: string;
  name: string;
  role?: string;
  location?: string;
  avatar?: string;
  rating: number;
  comment: string;
  date: string;
  verifiedVisit: boolean;
  purchasedProduct?: string;
  published?: boolean;
  order?: number;
}
