import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

# Remove imports
text = re.sub(r"import BuyVolumeModal from '\./components/BuyVolumeModal';\n", "", text)
text = re.sub(r"import ExamModal from '\./components/ExamModal';\n", "", text)

# Remove modal states
text = re.sub(r"  const \[buyVolumeModalOpen, setBuyVolumeModalOpen\] = useState\(false\);\n", "", text)
text = re.sub(r"  const \[selectedBuyPost, setSelectedBuyPost\] = useState<Post \| null>\(null\);\n", "", text)
text = re.sub(r"  const \[examModalOpen, setExamModalOpen\] = useState\(false\);\n", "", text)
text = re.sub(r"  const \[selectedExamPost, setSelectedExamPost\] = useState<Post \| null>\(null\);\n", "", text)

# Remove pendingAction state types
text = re.sub(r"  const \[pendingAction, setPendingAction\] = useState<\{ type: 'buy_volume' \| 'take_exam' \| 'telegram', post: Post \} \| null>\(null\);\n", "", text)

# Remove triggers
triggers = r"""  // 1\. Buy Volume Trigger \(Lazy Auth\)
  const handleTriggerBuyVolume = \(post: Post\) => \{
.*?
  \};

  // 2\. Take Exam Trigger \(Lazy Auth\)
  const handleTriggerTakeExam = \(post: Post\) => \{
.*?
  \};

  // 3\. Telegram Join Trigger \(Lazy Auth\)
  const handleTriggerTelegram = \(post: Post\) => \{
.*?
  \};"""
text = re.sub(triggers, "", text, flags=re.DOTALL)

# Handle pending action in success login
success_login = r"""    if \(pendingAction\) \{
      if \(pendingAction\.type === 'buy_volume'\) \{
        setSelectedBuyPost\(pendingAction\.post\);
        setBuyVolumeModalOpen\(true\);
      \} else if \(pendingAction\.type === 'take_exam'\) \{
        setSelectedExamPost\(pendingAction\.post\);
        setExamModalOpen\(true\);
      \} else if \(pendingAction\.type === 'telegram'\) \{
        window\.open\(pendingAction\.post\.telegram_link \|\| 'https://t\.me/buet_dmc_dreamers_official', '_blank'\);
      \}
      setPendingAction\(null\);
    \}"""
text = re.sub(success_login, "", text, flags=re.DOTALL)

# Remove prop passing in Home & PostDetail
text = re.sub(r"            onTriggerBuyVolume=\{handleTriggerBuyVolume\}\n", "", text)
text = re.sub(r"            onTriggerTakeExam=\{handleTriggerTakeExam\}\n", "", text)
text = re.sub(r"            onTriggerTelegram=\{handleTriggerTelegram\}\n", "", text)

text = re.sub(r"          onTriggerBuyVolume=\{handleTriggerBuyVolume\}\n", "", text)
text = re.sub(r"          onTriggerTakeExam=\{handleTriggerTakeExam\}\n", "", text)
text = re.sub(r"          onTriggerTelegram=\{handleTriggerTelegram\}\n", "", text)

# Remove modal JSX
modal_jsx = r"""      \{/\* Buy Volume & Checkout Modal \*/\}
      <BuyVolumeModal
        isOpen=\{buyVolumeModalOpen\}
        onClose=\{\(\) => setBuyVolumeModalOpen\(false\)\}
        post=\{selectedBuyPost\}
        user=\{user\}
      />
      \{/\* Live Model Exam Simulator Modal \*/\}
      \{selectedExamPost && \(
        <ExamModal
          isOpen=\{examModalOpen\}
          onClose=\{\(\) => setExamModalOpen\(false\)\}
          post=\{selectedExamPost\}
          user=\{user\}
        />
      \)\}"""
text = re.sub(modal_jsx, "", text, flags=re.DOTALL)

with open('src/App.tsx', 'w') as f:
    f.write(text)

