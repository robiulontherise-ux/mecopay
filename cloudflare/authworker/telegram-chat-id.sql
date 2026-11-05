-- Verified Telegram private-chat ID স্থায়ীভাবে সংরক্ষণের nullable কলাম।
ALTER TABLE mecopay_auth.account
  ADD COLUMN IF NOT EXISTS "telegramChatId" text;
