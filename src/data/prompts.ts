import { ClothingPromptItem } from '../types/prompt';
import { CLOTHING_PROMPT_LIBRARY as RAW_LIBRARY } from '../../prompt_library';

export const INITIAL_PROMPTS: ClothingPromptItem[] = RAW_LIBRARY.map((item, index) => ({
  ...item,
  content_type: 'image',
  recommended_tool: '',
  recommended_tool_url: '',
  published: true,
  featured: index < 6,
  sort_order: index + 1,
}));
