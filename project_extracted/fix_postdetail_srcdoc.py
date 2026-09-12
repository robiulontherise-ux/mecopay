import re
with open('src/components/PostDetail.tsx', 'r') as f:
    text = f.read()

srcdoc_regex = r"""  const srcDocWithResize = post\.content \? `\$\{post\.content\}
<script>
  function sendHeight\(\) \{
    window\.parent\.postMessage\(\{ type: 'resize', height: document\.documentElement\.scrollHeight \}, '\*'\);
  \}
  window\.onload = sendHeight;
  window\.onresize = sendHeight;
</script>` : '';"""

srcdoc_replacement = """  const srcDocWithResize = post.content ? `${post.content.startsWith('<!-- CODE:live_html -->') ? post.content.split('-->\\n').slice(1).join('-->\\n') : (post.content.startsWith('<!-- LIVE_CODE -->') ? post.content.replace('<!-- LIVE_CODE -->\\n', '').replace('<!-- LIVE_CODE -->', '') : post.content)}
<script>
  function sendHeight() {
    window.parent.postMessage({ type: 'resize', height: document.documentElement.scrollHeight }, '*');
  }
  window.onload = sendHeight;
  window.onresize = sendHeight;
</script>` : '';"""

text = re.sub(srcdoc_regex, srcdoc_replacement, text)

with open('src/components/PostDetail.tsx', 'w') as f:
    f.write(text)
