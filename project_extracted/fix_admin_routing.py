import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

# Fix routing logic for admin to allow opening Admin Panel without checking hash directly for isAdmin (as it is async)
# Change from:
#      } else if (hash === 'admin') {
#        if (isAdmin) {
#          setCurrentView('admin');
#        }
#      }
# To:
#      } else if (hash === 'admin') {
#        setCurrentView('admin');
#      }

routing_regex = r"""      \} else if \(hash === 'admin'\) \{
        if \(isAdmin\) \{
          setCurrentView\('admin'\);
        \}
      \}"""

routing_replacement = """      } else if (hash === 'admin') {
        setCurrentView('admin');
      }"""

text = re.sub(routing_regex, routing_replacement, text)


with open('src/App.tsx', 'w') as f:
    f.write(text)

