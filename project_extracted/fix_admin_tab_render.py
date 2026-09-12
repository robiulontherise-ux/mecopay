import re

with open('src/components/AdminPanel.tsx', 'r') as f:
    text = f.read()

# Make sure tabs have valid IDs and use activeTab logic correctly
# Replace all activeTab === 'posts' rendering issue
# Check if there's any CSS hiding the div
text = text.replace("      {/* Main Admin Workspace */}", "      {/* Main Admin Workspace */}\n      {/* DEBUG: {activeTab} */}")

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(text)

