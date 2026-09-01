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
  category: PromptCategory;
  subcategory: string;
  productType: string;
  description: string; // What is this?
  useCase: string; // When should I use it & what will I get?
  prompt: string; // Complete, copy-ready AI instruction
  aspectRatio: PromptAspectRatio;
  difficulty: PromptDifficulty;
  tags: string[];
  featured?: boolean;
  published?: boolean;
  order?: number;
}
