export interface Category {
  client_id?: string;
  id: string;
  name: string;
  slug: string;
  order_index: number;
  description?: string;
  icon_name?: string;
  created_at?: string;
  parent_id?: string | null;
}

export interface Post {
  client_id?: string;
  id: string;
  title: string;
  slug: string;
  content: string;
  category_id: string;
  thumbnail: string;
  created_at: string;
  updated_at?: string;
  views_count?: number;
  format_type?: 'standard' | 'code';
  code_language?: string;
  
  // Custom Display Options
  show_details_btn?: boolean;
  show_share_btn?: boolean;
  show_thumbnail?: boolean;
  show_full_post?: boolean;
  is_custom_page?: boolean;
  product_type?: 'physical' | 'digital' | 'just_form';
  digital_settings?: {
    buttons?: Array<{
      label: string;
      page_id: string; // The ID of the post/page that contains the content
      icon?: string;
    }>;
  };
  summary?: string;
  tags?: string[];
}

export interface Purchase {
  id: string;
  client_id: string;
  customer_id: string;
  post_id: string;
  amount: number;
  payment_status: 'pending' | 'paid' | 'failed';
  fulfillment_status: 'pending' | 'shipped' | 'delivered';
  created_at: string;
  post?: Post;
}

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: 'admin' | 'student';
  created_at?: string;
}

export interface CAPITrackingEvent {
  event_name: 'PageView' | 'ViewContent' | 'InitiateCheckout' | 'Purchase' | 'Lead' | 'CompleteRegistration' | 'TakeExamClick' | 'Custom';
  event_time: number;
  event_id: string;
  user_data: {
    em?: string; // SHA-256 hashed or raw email
    client_ip_address?: string;
    client_user_agent?: string;
    fbp?: string;
    fbc?: string;
    session_id?: string;
  };
  custom_data?: Record<string, any>;
  event_source_url: string;
  action_source: 'website';
}

export interface SiteSettings {
  client_id?: string;
  owner_email?: string;
  id: string;
  site_name: string;
  site_logo: string;
  site_name_color?: string;
  site_name_size?: string;
  primary_color: string;
  text_size: string;
  show_default_home: boolean;
  default_home_content: string;
  default_home_format_type?: 'standard' | 'code';
}
