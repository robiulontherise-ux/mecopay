import re

with open('src/components/PostDetail.tsx', 'r') as f:
    text = f.read()

# Conditionally render share button
share_old = """            <button 
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-xs text-slate-200 transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied Link' : 'Share'}</span>
            </button>"""
            
share_new = """            {post.show_share_btn !== false && (
              <button 
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-xs text-slate-200 transition-colors"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied Link' : 'Share'}</span>
              </button>
            )}"""
text = text.replace(share_old, share_new)


# Conditionally render thumbnail
thumb_old = """            {/* Featured Image */}
            {post.thumbnail && (
              <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-900">
                <img
                  src={post.thumbnail}
                  alt={post.title}
                  className="w-full h-72 sm:h-96 object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}"""
            
thumb_new = """            {/* Featured Image */}
            {post.thumbnail && post.show_thumbnail !== false && (
              <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-900">
                <img
                  src={post.thumbnail}
                  alt={post.title}
                  className="w-full h-72 sm:h-96 object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}"""
text = text.replace(thumb_old, thumb_new)

with open('src/components/PostDetail.tsx', 'w') as f:
    f.write(text)

