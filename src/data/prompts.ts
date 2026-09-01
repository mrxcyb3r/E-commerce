import { ClothingPromptItem } from '../types/prompt';
import { CLOTHING_PROMPT_LIBRARY as RAW_LIBRARY } from '../../prompt_library';

export const INITIAL_PROMPTS: ClothingPromptItem[] = RAW_LIBRARY.map((item, index) => ({
  ...item,
  published: true,
  featured: index < 6,
  order: index + 1,
}));
