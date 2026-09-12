with open('src/App.tsx', 'r') as f:
    text = f.read()

import re

# Remove any remnants of onTrigger props from App.tsx rendering
text = re.sub(r'\s*onTriggerBuyVolume=\{handleTriggerBuyVolume\}', '', text)
text = re.sub(r'\s*onTriggerTakeExam=\{handleTriggerTakeExam\}', '', text)
text = re.sub(r'\s*onTriggerTelegram=\{handleTriggerTelegram\}', '', text)

# Just to be 100% sure we don't have pendingAction logic
text = re.sub(r'    if \(pendingAction\).*?      setPendingAction\(null\);\n    \}\n', '', text, flags=re.DOTALL)

with open('src/App.tsx', 'w') as f:
    f.write(text)

