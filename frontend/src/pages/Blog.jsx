/**
 * Blog — Blog listing page + BlogPost (single post)
 */
import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api';
import SEOHead from '../components/SEOHead';
import { BRAND_NAME } from '../constants';
import { Calendar, Eye, ArrowLeft, ArrowRight } from 'lucide-react';

export function BlogList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/blog');
        setPosts(data.data || []);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <SEOHead page="blog" />
      <h1 className="text-3xl font-display font-bold mb-2">{BRAND_NAME} Blog</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--pb-text-secondary)' }}>Tips on sustainable living, eco-friendly products, and plant-based lifestyle.</p>

      {loading ? (
        <div className="grid md:grid-cols-3 gap-6">{Array(6).fill(0).map((_, i) => <div key={i} className="shimmer h-72 rounded-2xl" />)}</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border" style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}>
          <p className="text-lg font-bold mb-2">Blog coming soon!</p>
          <p className="text-sm" style={{ color: 'var(--pb-text-secondary)' }}>Stay tuned for articles on sustainable living.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6 stagger">
          {posts.map(post => (
            <Link key={post._id} to={`/blog/${post.slug}`} className="rounded-2xl border overflow-hidden card-lift group"
              style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}>
              <div className="h-44 overflow-hidden" style={{ backgroundColor: 'var(--pb-border)' }}>
                {post.coverImage ? (
                  <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">🌿</div>
                )}
              </div>
              <div className="p-5">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(141,182,0,0.1)', color: 'var(--pb-accent)' }}>
                  {post.category}
                </span>
                <h3 className="text-base font-bold mt-2 line-clamp-2">{post.title}</h3>
                <p className="text-xs mt-2 line-clamp-2" style={{ color: 'var(--pb-text-secondary)' }}>{post.excerpt}</p>
                <div className="flex items-center gap-3 mt-3 text-[10px]" style={{ color: 'var(--pb-text-secondary)' }}>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.views} views</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/blog/${slug}`);
        setPost(data.data);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    load();
  }, [slug]);

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-8"><div className="shimmer h-96 rounded-2xl" /></div>;
  if (!post) return <div className="max-w-3xl mx-auto px-4 py-20 text-center"><p className="font-bold">Post not found</p></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <SEOHead title={post.seoTitle || post.title} description={post.seoDescription || post.excerpt} />
      <Link to="/blog" className="flex items-center gap-2 text-sm font-medium mb-6 hover:gap-3 transition-all" style={{ color: 'var(--pb-accent)' }}>
        <ArrowLeft className="w-4 h-4" /> Back to Blog
      </Link>

      <span className="text-xs font-bold uppercase px-2.5 py-1 rounded-full" style={{ backgroundColor: 'rgba(141,182,0,0.1)', color: 'var(--pb-accent)' }}>
        {post.category}
      </span>
      <h1 className="text-3xl font-display font-bold mt-3 mb-4">{post.title}</h1>
      <div className="flex items-center gap-4 mb-8 text-xs" style={{ color: 'var(--pb-text-secondary)' }}>
        <span>By {post.author?.name || 'Admin'}</span>
        <span>{new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        <span>{post.views} views</span>
      </div>

      {post.coverImage && (
        <img src={post.coverImage} alt={post.title} className="w-full rounded-2xl mb-8 object-cover max-h-96" />
      )}

      <div className="prose-content" dangerouslySetInnerHTML={{ __html: post.content }} />
    </div>
  );
}

export default BlogList;
