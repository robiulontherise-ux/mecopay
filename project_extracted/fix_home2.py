import re

with open('src/components/Home.tsx', 'r') as f:
    text = f.read()

# Remove the matchSummary and matchTags
text = re.sub(r'          const matchSummary = \(post\.summary \|\| \'\'\)\.toLowerCase\(\)\.includes\(q\);\n', '', text)
text = re.sub(r'          const matchTags = \(post\.tags \|\| \[\]\)\.some\(\(t\) => t\.toLowerCase\(\)\.includes\(q\)\);\n', '', text)
text = re.sub(r'          if \(!matchTitle && !matchSummary && !matchTags\) return false;\n', '          if (!matchTitle) return false;\n', text)


# Remove the absolute top-3 left-3 tags for is_paid and exam
tags = r"""                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    <span className=\{`inline-flex items-center px-2\.5 py-1 rounded-full text-\[10px\] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md \$\{
                      post\.is_paid 
                         \? 'bg-amber-500/90 text-amber-50 border border-amber-400/50' 
                         : 'bg-emerald-500/90 text-emerald-50 border border-emerald-400/50'
                    \}`\}>
                      \{post\.is_paid \? 'Premium' : 'Free Access'\}
                    </span>
                                        </div>"""
text = re.sub(tags, '', text, flags=re.DOTALL)

# Remove summary 
summary = r"""                  <p className="text-sm text-slate-400 line-clamp-3 mb-6 flex-1 leading-relaxed">
                    \{post\.summary\}
                  </p>"""
text = re.sub(summary, '', text, flags=re.DOTALL)

# Remove author block 
author = r"""                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                        <User className="w-3 h-3 text-slate-400" />
                      </div>
                      <span className="text-\[10px\] font-medium text-slate-400 truncate max-w-\[100px\]">
                        \{post\.author \|\| 'RSG EDU Team'\}
                      </span>
                    </div>"""
text = re.sub(author, '', text, flags=re.DOTALL)

# Remove onTrigger... from props
text = re.sub(r'  onTriggerBuyVolume: \(post: Post\) => void;\n', '', text)
text = re.sub(r'  onTriggerTakeExam: \(post: Post\) => void;\n', '', text)
text = re.sub(r'  onTriggerTelegram: \(post: Post\) => void;\n', '', text)
text = re.sub(r'  onTriggerBuyVolume,\n', '', text)
text = re.sub(r'  onTriggerTakeExam,\n', '', text)
text = re.sub(r'  onTriggerTelegram,\n', '', text)

with open('src/components/Home.tsx', 'w') as f:
    f.write(text)

