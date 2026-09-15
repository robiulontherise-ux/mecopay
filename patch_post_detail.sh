sed -i 's/onSelectPost: (post: Post) => void;/onSelectPost: (post: Post) => void;\n  onOpenAuthModal: () => void;/' src/mysite/components/PostDetail.tsx
sed -i 's/  onSelectPost,/  onSelectPost,\n  onOpenAuthModal,/' src/mysite/components/PostDetail.tsx
