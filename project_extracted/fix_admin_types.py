import re

with open('src/components/AdminPanel.tsx', 'r') as f:
    text = f.read()

# Replace properties in post list display
text = re.sub(r'                      \{p\.is_paid \? \(.*?\) : \(.*?\)\}\n', '', text, flags=re.DOTALL)
text = re.sub(r'                        \{p\.is_paid \? `৳\$\{p\.price\}` : \'Free\'\}\n', '', text, flags=re.DOTALL)
text = re.sub(r'                        \{p\.summary \? p\.summary\.substring\(0, 60\) \+ \'\.\.\.\' : \'No summary\'\}\n', '', text, flags=re.DOTALL)

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(text)

