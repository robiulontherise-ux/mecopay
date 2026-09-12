import re

with open('src/types.ts', 'r') as f:
    text = f.read()

old_str = """  text_size: string;
  show_default_home: boolean;
  default_home_content: string;
}"""

new_str = """  text_size: string;
  show_default_home: boolean;
  default_home_content: string;
  default_home_format_type?: 'standard' | 'code';
}"""

text = text.replace(old_str, new_str)

with open('src/types.ts', 'w') as f:
    f.write(text)
