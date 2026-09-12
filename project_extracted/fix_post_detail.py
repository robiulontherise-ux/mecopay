import re

with open('src/components/PostDetail.tsx', 'r') as f:
    text = f.read()

# Prop interface
text = re.sub(r'  onTriggerBuyVolume: \(post: Post\) => void;\n', '', text)
text = re.sub(r'  onTriggerTakeExam: \(post: Post\) => void;\n', '', text)
text = re.sub(r'  onTriggerTelegram: \(post: Post\) => void;\n', '', text)

# Prop arguments
text = re.sub(r'  onTriggerBuyVolume,\n', '', text)
text = re.sub(r'  onTriggerTakeExam,\n', '', text)
text = re.sub(r'  onTriggerTelegram,\n', '', text)

# Subheader meta info
meta_author = r"""            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mb-8 border-b border-slate-800 pb-4">.*?<\/div>"""
text = re.sub(meta_author, '', text, flags=re.DOTALL)
# wait, there's another border-b div below it. Let's just do targeted replacements.

# Let's remove the summary
summary_callout = r"""            \{\/\* Excerpt Callout \*\/\}
            \{post\.summary && \(
              <div className="p-4 rounded-xl bg-slate-900/90 border-l-4 border-indigo-500 text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                \{post\.summary\}
              <\/div>
            \)\}"""
text = re.sub(summary_callout, '', text, flags=re.DOTALL)

# Let's remove Telegram
telegram = r"""            \{\/\* Telegram Community Join Banner \*\/\}.*?<\/div>\n          <\/main>"""
text = re.sub(telegram, '          </main>', text, flags=re.DOTALL)

# Let's remove Action Box Buy Volume
buy = r"""            \{\/\* Action Box: Buy Volume CTA \(Lazy Auth Trigger\) \*\/\}.*?<\/div>"""
text = re.sub(buy, '', text, flags=re.DOTALL)

# Let's remove Action Box Take Exam
exam = r"""            \{\/\* Action Box: Take Exam CTA \(Lazy Auth Trigger\) \*\/\}.*?<\/div>"""
text = re.sub(exam, '', text, flags=re.DOTALL)


with open('src/components/PostDetail.tsx', 'w') as f:
    f.write(text)

