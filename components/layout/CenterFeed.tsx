'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Profile, Post, supabase, isSupabaseConnected } from '@/lib/supabase';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Heart, MessageCircle, Flag, Share2, CheckCircle, BookOpen, Gift, Lock, Edit, Trash2, EyeOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CenterFeedProps {
  user: User | null;
  profile: Profile | null;
}

export default function CenterFeed({ user, profile }: CenterFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [composerType, setComposerType] = useState<'wisdom' | 'donation'>('wisdom');
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  
  const [content, setContent] = useState('');
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceCategory, setResourceCategory] = useState('');
  const [resourceContact, setResourceContact] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [editContent, setEditContent] = useState('');
  const [editResourceTitle, setEditResourceTitle] = useState('');
  const [editResourceCategory, setEditResourceCategory] = useState('');
  const [editResourceContact, setEditResourceContact] = useState('');

  const fetchPosts = async () => {
    if (!isSupabaseConnected) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`*, profiles (*)`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Could not load the feed. Please try refreshing.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    
    const channel = supabase
      .channel('posts-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        console.log('Post change detected, refetching feed.');
        fetchPosts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const canPost = () => {
    return !!(user && profile && (profile.role === 'donor' || profile.verification_status === 'verified'));
  };

  const canClaimResource = () => {
    if (!user || !profile) return false;
    return profile.role === 'student' && profile.verification_status === 'verified';
  };
  
  const getPostingRestrictionMessage = () => {
    if (!user || !profile) return 'Sign in to share content';
    if (profile.role === 'student' && profile.verification_status !== 'verified') {
      return 'Verify your account to post';
    }
    return 'Share your thoughts with the community!';
  };

  const getUserBadges = (userProfile: Profile) => {
    const badges = [];
    if (userProfile.role === 'donor') {
      badges.push(<Badge key="role" variant="outline" className="text-green-700 border-green-300 bg-green-50">❤️ Donor</Badge>);
    } else {
      badges.push(<Badge key="role" variant="outline" className="text-blue-700 border-blue-300 bg-blue-50">🎓 Student</Badge>);
    }
    if (userProfile.role === 'donor' || userProfile.verification_status === 'verified') {
      badges.push(<CheckCircle key="verified" className="w-4 h-4 text-green-600" title="Verified" />);
    }
    return badges;
  };

  const handleSubmitPost = async () => {
    if (!user || !canPost()) return;

    if (composerType === 'wisdom' && !content.trim()) {
      toast.error('Please enter some wisdom to share');
      return;
    }

    if (composerType === 'donation' && (!resourceTitle.trim() || !resourceCategory || !resourceContact.trim())) {
      toast.error('Please fill in all donation details');
      return;
    }

    setSubmitting(true);
    try {
      const postData = {
        user_id: user.id,
        post_type: composerType,
        ...(composerType === 'wisdom' 
          ? { content: content.trim() }
          : { resource_title: resourceTitle.trim(), resource_category: resourceCategory, resource_contact: resourceContact.trim() })
      };
      const { error } = await supabase.from('posts').insert(postData);
      if (error) throw error;
      
      setContent(''); setResourceTitle(''); setResourceCategory(''); setResourceContact('');
      toast.success('Your post has been shared!');
    } catch (error) {
      toast.error('Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };
  
    const handleEditPost = (post: Post) => {
    setEditingPost(post);
    if (post.post_type === 'wisdom') {
      setEditContent(post.content || '');
    } else {
      setEditResourceTitle(post.resource_title || '');
      setEditResourceCategory(post.resource_category || '');
      setEditResourceContact(post.resource_contact || '');
    }
  };

  const handleUpdatePost = async () => {
    if (!editingPost) return;

    try {
      const updateData = editingPost.post_type === 'wisdom' 
        ? { content: editContent.trim() }
        : {
            resource_title: editResourceTitle.trim(),
            resource_category: editResourceCategory,
            resource_contact: editResourceContact.trim()
          };

      const { error } = await supabase
        .from('posts')
        .update(updateData)
        .eq('id', editingPost.id);

      if (error) throw error;

      setEditingPost(null);
      toast.success('Post updated successfully!');
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Failed to update post');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast.success('Post deleted successfully!');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const canEditPost = (post: Post) => {
    return user && post.user_id === user.id;
  };
  
  const handleClaimResource = (post: Post) => {
    if (!canClaimResource()) {
      if (!user) {
        toast.error('Please sign in to claim resources');
        return;
      }
      if (profile?.role !== 'student') {
        toast.error('Only students can claim resources');
        return;
      }
      if (profile?.verification_status !== 'verified') {
        toast.error('You need to be a verified student to claim resources');
        return;
      }
    }
    toast.success(`Contact the donor: ${post.resource_contact}`);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse p-6">
            <div className="flex space-x-4">
                <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                <div className="flex-1 space-y-4 py-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {user && profile && (
         <Card>
          <CardHeader>
            <Tabs value={composerType} onValueChange={(value) => setComposerType(value as 'wisdom' | 'donation')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="wisdom" className="flex items-center"><BookOpen className="w-4 h-4 mr-2" /> Share Wisdom</TabsTrigger>
                <TabsTrigger value="donation" className="flex items-center"><Gift className="w-4 h-4 mr-2" /> Donate Resource</TabsTrigger>
              </TabsList>
              <TabsContent value="wisdom" className="space-y-4 pt-4">
                <Textarea placeholder={canPost() ? "Share your knowledge, experience, or advice..." : getPostingRestrictionMessage()} value={content} onChange={(e) => setContent(e.target.value)} disabled={!canPost()} className="min-h-[100px]" />
              </TabsContent>
              <TabsContent value="donation" className="space-y-4 pt-4">
                <Input placeholder={canPost() ? "Resource Title (e.g., 'Programming Books')" : getPostingRestrictionMessage()} value={resourceTitle} onChange={(e) => setResourceTitle(e.target.value)} disabled={!canPost()} />
                <Select value={resourceCategory} onValueChange={setResourceCategory} disabled={!canPost()}><SelectTrigger><SelectValue placeholder="Select donation category" /></SelectTrigger><SelectContent><SelectItem value="books">📚 Books</SelectItem><SelectItem value="electronics">💻 Electronics</SelectItem><SelectItem value="courses">🎓 Courses</SelectItem><SelectItem value="mentorship">👨‍🏫 Mentorship</SelectItem><SelectItem value="software">⚡ Software</SelectItem><SelectItem value="other">🎁 Other</SelectItem></SelectContent></Select>
                <Input placeholder={canPost() ? "Contact Info (email, etc.)" : getPostingRestrictionMessage()} value={resourceContact} onChange={(e) => setResourceContact(e.target.value)} disabled={!canPost()} />
              </TabsContent>
            </Tabs>
            {canPost() ? <Button onClick={handleSubmitPost} disabled={submitting} className="w-full mt-2">{submitting ? 'Posting...' : 'Post'}</Button> : null}
          </CardHeader>
        </Card>
      )}

      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <Avatar><AvatarFallback className={`text-white ${post.profiles?.role === 'donor' ? 'bg-green-600' : 'bg-blue-600'}`}>{post.profiles?.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback></Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <span className="font-semibold text-gray-900">{post.profiles?.username || 'Unknown User'}</span>
                      <div className="flex items-center space-x-1">{post.profiles && getUserBadges(post.profiles)}</div>
                      <Badge variant={post.post_type === 'wisdom' ? 'default' : 'secondary'} className={post.post_type === 'wisdom' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>{post.post_type === 'wisdom' ? '💡 Wisdom' : '🎁 Resource'}</Badge>
                      <span className="text-sm text-gray-500">{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                    </div>
                    {canEditPost(post) && <div className="flex items-center space-x-2"><Button variant="ghost" size="sm" onClick={() => handleEditPost(post)}><Edit className="w-4 h-4" /></Button><Button variant="ghost" size="sm" onClick={() => handleDeletePost(post.id)} className="text-red-600 hover:text-red-700"><Trash2 className="w-4 h-4" /></Button></div>}
                  </div>
                </div>
                {post.post_type === 'wisdom' ? <p className="text-gray-900 mb-4 leading-relaxed mt-2">{post.content}</p> : <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg mt-2 border border-green-200"><h4 className="font-semibold text-gray-900 mb-2 flex items-center"><Gift className="w-4 h-4 mr-2 text-green-600" />{post.resource_title}</h4><div className="flex items-center justify-between"><div className="flex items-center text-sm text-gray-600">{canClaimResource() ? <span><span className="font-medium">Contact:</span><span className="ml-1">{post.resource_contact}</span></span> : <span className="flex items-center"><EyeOff className="w-4 h-4 mr-1 text-gray-400" /><span>Verify to see contact</span></span>}</div><Button size="sm" className={canClaimResource() ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"} onClick={() => handleClaimResource(post)} disabled={!canClaimResource()}>{!canClaimResource() && <Lock className="w-3 h-3 mr-1" />}Claim</Button></div></div>}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center space-x-4 text-gray-500"><Button variant="ghost" size="sm" className="hover:text-red-600"><Heart className="w-4 h-4 mr-1" />Like</Button><Button variant="ghost" size="sm" className="hover:text-blue-600"><MessageCircle className="w-4 h-4 mr-1" />Comment</Button><Button variant="ghost" size="sm" className="hover:text-red-600 ml-auto"><Flag className="w-4 h-4 mr-1" />Report</Button></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
