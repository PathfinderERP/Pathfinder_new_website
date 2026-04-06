import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    CalendarIcon,
    ClockIcon,
    UserIcon,
    ArrowLeftIcon,
    TagIcon,
    ShareIcon
} from '@heroicons/react/24/outline';
import { blogAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const BlogPostDetail = () => {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchPost = async () => {
            try {
                setLoading(true);
                const response = await blogAPI.getById(slug);
                setPost(response.data);
                
                // --- ADVANCED SEO MANAGEMENT ---
                if (response.data) {
                    const post = response.data;
                    const siteTitle = "Pathfinder Institute";
                    const pageTitle = `${post.title} | ${siteTitle}`;
                    document.title = pageTitle;

                    // Helper to update/create meta tags
                    const updateMeta = (name, content, attr = 'name') => {
                        let tag = document.querySelector(`meta[${attr}="${name}"]`);
                        if (!tag) {
                            tag = document.createElement('meta');
                            tag.setAttribute(attr, name);
                            document.head.appendChild(tag);
                        }
                        tag.setAttribute('content', content || "");
                    };

                    // Extract a clean description from the HTML content (max 160 chars)
                    const plainText = (post.content || "").replace(/<[^>]*>/g, '').substring(0, 160).trim();

                    // Standard SEO
                    updateMeta('description', plainText);
                    updateMeta('keywords', `${post.category}, NEET, JEE, Pathfinder, ${post.author}`);

                    // OpenGraph (Social Sharing: WhatsApp, Facebook, etc.)
                    updateMeta('og:title', pageTitle, 'property');
                    updateMeta('og:description', plainText, 'property');
                    updateMeta('og:image', post.image_url || "/images/blog/placeholder.webp", 'property');
                    updateMeta('og:url', window.location.href, 'property');
                    updateMeta('og:type', 'article', 'property');

                    // Twitter Card
                    updateMeta('twitter:card', 'summary_large_image');
                    updateMeta('twitter:title', pageTitle);
                    updateMeta('twitter:description', plainText);
                    updateMeta('twitter:image', post.image_url || "/images/blog/placeholder.webp");
                }
            } catch (err) {
                console.error("Error fetching post:", err);
                setError("Post not found.");
            } finally {
                setLoading(false);
            }
        };
        fetchPost();

        // Cleanup: Reset title when leaving the page
        return () => {
            document.title = "Pathfinder Institute";
        };
    }, [slug]);

    if (loading) return <div className="min-h-screen pt-32"><LoadingSpinner /></div>;
    if (error || !post) return (
        <div className="min-h-screen flex flex-col items-center justify-center pt-24">
            <h2 className="text-2xl font-bold mb-4">{error || "Post not found"}</h2>
            <Link to="/blog" className="text-orange-600 font-bold hover:underline flex items-center gap-2">
                <ArrowLeftIcon className="w-4 h-4" /> Back to Blog
            </Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-white pt-24 pb-20">
            {/* Header / Hero */}
            <section className="relative h-[40vh] md:h-[60vh] min-h-[400px] overflow-hidden">
                <img
                    src={post.image_url || "/images/blog/placeholder.webp"}
                    alt={post.title}
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

                <div className="absolute bottom-0 left-0 w-full pb-12">
                    <div className="max-w-4xl mx-auto px-4">
                        <Link to="/blog" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors">
                            <ArrowLeftIcon className="w-4 h-4" />
                            Back to Articles
                        </Link>

                        <div className="flex items-center gap-4 mb-4">
                            <span className="px-3 py-1 bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                                {post.category}
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                            {post.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-sm text-slate-300">
                            <div className="flex items-center gap-2">
                                <UserIcon className="w-4 h-4" />
                                {post.author}
                            </div>
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4" />
                                {new Date(post.published_date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2">
                                <ClockIcon className="w-4 h-4" />
                                {post.read_time}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Article Content */}
            <article className="max-w-4xl mx-auto px-4 py-16">
                <div className="flex flex-col md:flex-row gap-12">
                    {/* Main Content */}
                    <div className="flex-grow">
                        <div
                            className="prose prose-lg prose-slate max-w-none 
                                     prose-headings:text-slate-900 prose-headings:font-black
                                     prose-p:text-slate-600 prose-p:leading-relaxed
                                     prose-strong:text-slate-900
                                     prose-img:rounded-3xl prose-img:shadow-2xl"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />

                        {/* Tags / Sharing */}
                        <div className="mt-8 md:mt-16 pt-6 md:pt-8 border-t border-slate-100 flex flex-wrap justify-between items-center gap-6">
                            <div className="flex items-center gap-2">
                                <TagIcon className="w-5 h-5 text-slate-400" />
                                <span className="text-slate-500 text-sm">Tags:</span>
                                <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg uppercase tracking-wider">
                                    {post.category}
                                </span>
                            </div>

                            <button
                                onClick={() => navigator.clipboard.writeText(window.location.href)}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-900/20 active:scale-95"
                            >
                                <ShareIcon className="w-4 h-4" />
                                Share Article
                            </button>
                        </div>
                    </div>
                </div>
            </article>

            {/* Newsletter Call to Action */}
            <section className="max-w-4xl mx-auto px-4 mt-12">
                <div className="bg-orange-50 rounded-[2.5rem] p-8 md:p-12 border border-orange-100 text-center">
                    <h3 className="text-2xl font-black text-slate-900 mb-4">Enjoyed this article?</h3>
                    <p className="text-slate-600 mb-8">Subscribe to our newsletter and get the latest updates right in your inbox.</p>
                    <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
                        <input
                            type="email"
                            placeholder="Your email address"
                            className="flex-grow px-5 py-3 rounded-xl border border-orange-200 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                        />
                        <button className="px-8 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition shadow-lg shadow-orange-600/20 whitespace-nowrap">
                            Join Now
                        </button>
                    </form>
                </div>
            </section>
        </div>
    );
};

export default BlogPostDetail;
