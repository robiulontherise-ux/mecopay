import re

with open('src/components/AdminPanel.tsx', 'r') as f:
    text = f.read()
    
# Debug why 'new-post' isn't rendering
# The issue might be that ReactQuill is gone but some related logic broke it, or the activeTab state is not properly transitioning
# Let's ensure the render block for new-post is correct

render_regex = r"""        \{\(activeTab === 'new-post' \|\| activeTab === 'edit-post'\) && \("""
render_replacement = """        {(activeTab === 'new-post' || activeTab === 'edit-post') && ("""
text = re.sub(render_regex, render_replacement, text)

# Ensure no early returns block it
text = text.replace("      {/* DEBUG: {activeTab} */}", "      {/* DEBUG: Active Tab is {activeTab} */}")

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(text)

