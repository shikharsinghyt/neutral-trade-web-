/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Heart, Share2, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorPhoto: string;
  createdAt: any;
  likes: number;
}

export default function Community() {
  const { user, login } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Post[]);
    });
    return () => unsubscribe();
  }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return login();
    if (!newTitle || !newContent) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'posts'), {
        title: newTitle,
        content: newContent,
        authorId: user.uid,
        authorName: user.displayName,
        authorPhoto: user.photoURL,
        createdAt: serverTimestamp(),
        likes: 0
      });
      setNewTitle('');
      setNewContent('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return login();
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      likes: increment(1)
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Trader Community</h2>
        <p className="text-slate-400 font-light">Share intelligence and synchronize with other market elites.</p>
      </div>

      <div className="glass-card mb-12 overflow-hidden">
        <CardContent className="p-8">
          <form onSubmit={handlePost} className="space-y-6">
            <Input 
              placeholder="Thesis Title..." 
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="bg-black/20 border-white/10 text-white font-bold h-12 focus:border-cyan-400/50 transition-all"
            />
            <Textarea 
              placeholder="Log your market breakdown or pattern observation..." 
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              className="bg-black/20 border-white/10 text-white min-h-[120px] resize-none focus:border-cyan-400/50 transition-all font-light"
            />
            <div className="flex justify-between items-center">
              <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                {user ? `IDENTITY: ${user.displayName}` : 'AUTHENTICATION REQUIRED'}
              </p>
              <Button type="submit" disabled={submitting} className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-8 rounded-xl h-11 transition-all shadow-lg shadow-cyan-500/20">
                {submitting ? 'TRANSMITTING...' : 'BROADCAST'}
                {!submitting && <Send className="ml-2 w-4 h-4" />}
              </Button>
            </div>
          </form>
        </CardContent>
      </div>

      <div className="space-y-8">
        {posts.map(post => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="glass-card overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="ring-1 ring-white/10 w-10 h-10">
                    <AvatarImage src={post.authorPhoto} />
                    <AvatarFallback className="bg-white/5 text-slate-400">{post.authorName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="text-white font-bold text-sm tracking-tight">{post.authorName}</div>
                      <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-400/20 text-[8px] font-black tracking-tighter px-1.5 py-0">ELITE</Badge>
                    </div>
                    <div className="text-slate-500 text-[10px] font-mono uppercase">
                      REF_TIME: {post.createdAt?.toDate ? formatDistanceToNow(post.createdAt.toDate()) : 'pending'} AGO
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{post.title}</h3>
                <p className="text-slate-400 mb-8 leading-relaxed font-light whitespace-pre-wrap">{post.content}</p>
                <div className="flex items-center gap-8 pt-6 border-t border-white/5">
                  <button 
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-2.5 text-slate-500 hover:text-cyan-400 transition-all group"
                  >
                    <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-cyan-500/10 transition-all">
                      <Heart className={`w-4 h-4 ${post.likes > 0 ? 'fill-cyan-400 text-cyan-400' : ''}`} />
                    </div>
                    <span className="text-xs font-bold font-mono">{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-2.5 text-slate-500 hover:text-indigo-400 transition-all group">
                    <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/10 transition-all">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold font-mono">0</span>
                  </button>
                  <button className="flex items-center gap-2.5 text-slate-500 hover:text-emerald-400 transition-all group ml-auto">
                    <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-emerald-500/10 transition-all">
                      <Share2 className="w-4 h-4" />
                    </div>
                  </button>
                </div>
              </CardContent>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
