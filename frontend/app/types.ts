export interface Shelter {
  id: number;
  name: string;
  website: string;
  location: string;
  cat_count?: number;
}

export interface Cat {
  id: number;
  name: string;
  gender: string;
  age_text: string;
  age_category: string;
  shelter_id: number;
  location: string;
  description: string | null;
  tags: string[];
  image_url: string | null;
  source_url: string;
  status: string;
  scraped_at: string;
  created_at: string;
  updated_at: string;
  shelter?: Shelter | null;
}

export interface CatList {
  total: number;
  page: number;
  per_page: number;
  cats: Cat[];
}

export interface Stats {
  total_cats: number;
  total_shelters: number;
  last_scrape: string | null;
}
