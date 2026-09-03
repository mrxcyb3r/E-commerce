export type PromptCategory = 
  | 'Men' 
  | 'Women' 
  | 'Kids & Baby' 
  | 'Schoolwear' 
  | 'Sportswear' 
  | 'Seasonal & Campaigns';

export type PromptAspectRatio = '4:5' | '9:16' | '1:1' | '16:9';
export type PromptDifficulty = 'Beginner' | 'Intermediate';

export interface ClothingPromptItem {
  id: string;
  title: string;
  description: string;
  content_type?: string;
  category: string;
  subcategory: string;
  productType: string;
  prompt: string;
  recommended_tool?: string;
  recommended_tool_url?: string;
  difficulty: string;
  tags: string[];
  aspectRatio: string;
  useCase?: string;
  featured?: boolean;
  published?: boolean;
  sort_order?: number;
}
