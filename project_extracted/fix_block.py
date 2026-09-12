with open('src/components/AdminPanel.tsx', 'r') as f:
    lines = f.readlines()

out = []
skip = False
for line in lines:
    if "content: isLiveCode &&" in line:
        out.append("      content: isLiveCode && !postContent.startsWith('<!-- LIVE_CODE -->') ? `<!-- LIVE_CODE -->\\n${postContent}` : (!isLiveCode && postContent.startsWith('<!-- LIVE_CODE -->\\n') ? postContent.replace('<!-- LIVE_CODE -->\\n', '') : postContent),\n")
        skip = True
    elif skip and "category_id:" in line:
        skip = False
        out.append(line)
    elif not skip:
        out.append(line)

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.writelines(out)
