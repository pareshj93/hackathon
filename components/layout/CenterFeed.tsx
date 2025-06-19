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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Heart, MessageCircle, Flag, Share2, CheckCircle, BookOpen, Gift, AlertCircle, Database, Phone, Mail, Lock, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CenterFeedProps {
  user: User | null;
  profile: Profile | null;
}

export default function CenterFeed({ user, profile }: CenterFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [composerType, setComposerType] = useState<'wisdom' | 'donation'>('wisdom');
  const [showDatabaseError, setShowDatabaseError] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  
  // Form states
  const [content, setContent] = useState('');
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceCategory, setResourceCategory] = useState('');
  const [resourceContact, setResourceContact] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit form states
  const [editContent, setEditContent] = useState('');
  const [editResourceTitle, setEditResourceTitle] = useState('');
  const [editResourceCategory, setEditResourceCategory] = useState('');
  const [editResourceContact, setEditResourceContact] = useState('');

  useEffect(() => {
    if (!isSupabaseConnected) {
      setLoading(false);
      return;
    }

    fetchPosts();
    
    // Subscribe to real-time updates
    const subscription = supabase
      .channel('posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        fetchPosts();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchPosts = async () => {
    if (!isSupabaseConnected) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        
        if (error.code === 'PGRST116' || error.message.includes('relation "posts" does not exist')) {
          setShowDatabaseError(true);
          setPosts([]);
          setLoading(false);
          return;
        }
        throw error;
      }
      
      setPosts(data || []);
      setShowDatabaseError(false);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setShowDatabaseError(true);
    } finally {
      setLoading(false);
    }
  };

  const canPost = () => {
    return !!(user && profile && isSupabaseConnected);
  };

  const canClaimResource = () => {
    if (!user || !profile) return false;
    return profile.role === 'student' && profile.verification_status === 'verified';
  };

  const canSeeContactInfo = (post: Post) => {
    if (!user || !profile) return false;
    return profile.role === 'student' && profile.verification_status === 'verified';
  };

  const canEditPost = (post: Post) => {
    return user && post.user_id === user.id;
  };

  const getPostingRestrictionMessage = () => {
    if (!user || !profile) return 'Sign in to share content';
    return 'Share your thoughts with the community!';
  };

  const getUserBadges = (userProfile: Profile) => {
    const badges = [];
    
    // Role badge
    if (userProfile.role === 'donor') {
      badges.push(
        <Badge key="role" variant="outline" className="text-green-700 border-green-300 bg-green-50">
          ❤️ Donor
        </Badge>
      );
    } else {
      badges.push(
        <Badge key="role" variant="outline" className="text-blue-700 border-blue-300 bg-blue-50">
          🎓 Student
        </Badge>
      );
    }
    
    // Verification badge
    if (userProfile.role === 'donor' || userProfile.verification_status === 'verified') {
      badges.push(
        <CheckCircle key="verified" className="w-4 h-4 text-green-600" title="Verified" />
      );
    }
    
    return badges;
  };

  const handleSubmitPost = async () => {
    if (!user || !profile || !canPost()) return;

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
          : {
              resource_title: resourceTitle.trim(),
              resource_category: resourceCategory,
              resource_contact: resourceContact.trim()
            })
      };

      const { error } = await supabase
        .from('posts')
        .insert(postData);

      if (error) throw error;

      // Reset form
      setContent('');
      setResourceTitle('');
      setResourceCategory('');
      setResourceContact('');
      
      toast.success(composerType === 'wisdom' ? 'Wisdom shared!' : 'Resource posted!');
    } catch (error) {
      console.error('Error creating post:', error);
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

  // Show database connection required message
  if (!isSupabaseConnected) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <Database className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Database Connection Required</h3>
            <p className="text-gray-600 mb-4">
              Connect to Supabase to start sharing wisdom and resources with the community.
            </p>
            <Button onClick={() => window.open('https://supabase.com', '_blank')}>
              Connect to Supabase
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showDatabaseError) {
    return (
      <div className="space-y-6">
        <Alert>
          <Database className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Database Setup Required</p>
              <p className="text-sm">
                The database tables haven't been created yet. Please ensure your Supabase project is properly configured.
              </p>
              <div className="mt-3">
                <Button 
                  onClick={() => {
                    setShowDatabaseError(false);
                    setLoading(true);
                    fetchPosts();
                  }}
                  size="sm"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Composer */}
      {user && profile && (
        <Card>
          <CardHeader>
            <Tabs value={composerType} onValueChange={(value) => setComposerType(value as 'wisdom' | 'donation')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="wisdom" className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Share Wisdom
                </TabsTrigger>
                <TabsTrigger value="donation" className="flex items-center">
                  <Gift className="w-4 h-4 mr-2" />
                  Donate Resource
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="wisdom" className="space-y-4">
                <Textarea
                  placeholder={canPost() ? "Share your knowledge, experience, or advice with the community..." : getPostingRestrictionMessage()}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={!canPost()}
                  className="min-h-[100px]"
                />
              </TabsContent>
              
              <TabsContent value="donation" className="space-y-4">
                <Input
                  placeholder={canPost() ? "What are you donating? (e.g., 'Programming Books', 'Laptop', 'Mentorship Sessions')" : getPostingRestrictionMessage()}
                  value={resourceTitle}
                  onChange={(e) => setResourceTitle(e.target.value)}
                  disabled={!canPost()}
                />
                <Select value={resourceCategory} onValueChange={setResourceCategory} disabled={!canPost()}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select donation category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="books">📚 Books & Study Materials</SelectItem>
                    <SelectItem value="stationery">✏️ Stationery & Supplies</SelectItem>
                    <SelectItem value="electronics">💻 Electronics & Gadgets</SelectItem>
                    <SelectItem value="courses">🎓 Online Courses & Subscriptions</SelectItem>
                    <SelectItem value="mentorship">👨‍🏫 Mentorship & Guidance</SelectItem>
                    <SelectItem value="scholarships">💰 Scholarships & Financial Aid</SelectItem>
                    <SelectItem value="internships">🏢 Internship Opportunities</SelectItem>
                    <SelectItem value="software">⚡ Software & Tools</SelectItem>
                    <SelectItem value="other">🎁 Other Resources</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="How can students contact you? (email, phone, or preferred method)"
                  value={resourceContact}
                  onChange={(e) => setResourceContact(e.target.value)}
                  disabled={!canPost()}
                />
              </TabsContent>
            </Tabs>
            
            {canPost() ? (
              <Button 
                onClick={handleSubmitPost} 
                disabled={submitting}
                className="w-full"
              >
                {submitting ? 'Posting...' : `Share ${composerType === 'wisdom' ? 'Wisdom' : 'Resource'}`}
              </Button>
            ) : (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600 mb-2">{getPostingRestrictionMessage()}</p>
                {!user && (
                  <Button 
                    size="sm" 
                    onClick={() => window.location.reload()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Join Community
                  </Button>
                )}
              </div>
            )}
          </CardHeader>
        </Card>
      )}

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-600 mb-4">Be the first to share wisdom or donate resources!</p>
              {!user && (
                <Button onClick={() => window.location.reload()}>
                  Join Community
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <Avatar>
                    <AvatarFallback className={`text-white ${post.profiles?.role === 'donor' ? 'bg-green-600' : 'bg-blue-600'}`}>
                      {post.profiles?.username?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <span className="font-semibold text-gray-900">
                          {post.profiles?.username || 'Unknown User'}
                        </span>
                        
                        {/* User badges */}
                        <div className="flex items-center space-x-1">
                          {post.profiles && getUserBadges(post.profiles)}
                        </div>
                        
                        {/* Post type badge */}
                        <Badge 
                          variant={post.post_type === 'wisdom' ? 'default' : 'secondary'}
                          className={post.post_type === 'wisdom' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}
                        >
                          {post.post_type === 'wisdom' ? '💡 Wisdom' : '🎁 Resource'}
                        </Badge>
                        
                        <span className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      
                      {/* Edit/Delete buttons for post owner */}
                      {canEditPost(post) && (
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditPost(post)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeletePost(post.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {post.post_type === 'wisdom' ? (
                      <p className="text-gray-900 mb-4 leading-relaxed">{post.content}</p>
                    ) : (
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg mb-4 border border-green-200">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                          <Gift className="w-4 h-4 mr-2 text-green-600" />
                          {post.resource_title}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center">
                            <span className="font-medium">Category:</span>
                            <span className="ml-1">{post.resource_category}</span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-600">
                            {canSeeContactInfo(post) ? (
                              <>
                                {post.resource_contact?.includes('@') ? (
                                  <Mail className="w-4 h-4 mr-1 text-blue-600" />
                                ) : (
                                  <Phone className="w-4 h-4 mr-1 text-green-600" />
                                )}
                                <span className="font-medium">Contact:</span>
                                <span className="ml-1">{post.resource_contact}</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-4 h-4 mr-1 text-gray-400" />
                                <span className="font-medium">Contact:</span>
                                <span className="ml-1 text-gray-400">Verification required to view</span>
                              </>
                            )}
                          </div>
                          <Button 
                            size="sm" 
                            className={canClaimResource() ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"}
                            onClick={() => handleClaimResource(post)}
                            disabled={!canClaimResource()}
                          >
                            {!canClaimResource() && (
                              <Lock className="w-3 h-3 mr-1" />
                            )}
                            {canClaimResource() ? 'Claim Resource' : 'Verification Required'}
                          </Button>
                        </div>
                        {!canClaimResource() && user && (
                          <div className="mt-2 text-xs text-gray-500">
                            {profile?.role !== 'student' 
                              ? 'Only students can claim resources' 
                              : 'Verify your student status to claim resources'
                            }
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-4 text-gray-500">
                      <Button variant="ghost" size="sm" className="hover:text-red-600">
                        <Heart className="w-4 h-4 mr-1" />
                        Like
                      </Button>
                      <Button variant="ghost" size="sm" className="hover:text-blue-600">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Comment
                      </Button>
                      <Button variant="ghost" size="sm" className="hover:text-green-600">
                        <Share2 className="w-4 h-4 mr-1" />
                        Share
                      </Button>
                      <Button variant="ghost" size="sm" className="hover:text-red-600 ml-auto">
                        <Flag className="w-4 h-4 mr-1" />
                        Report
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Post Dialog */}
      {editingPost && (
        <Dialog open={!!editingPost} onOpenChange={() => setEditingPost(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {editingPost.post_type === 'wisdom' ? (
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Edit your wisdom..."
                  className="min-h-[100px]"
                />
              ) : (
                <>
                  <Input
                    value={editResourceTitle}
                    onChange={(e) => setEditResourceTitle(e.target.value)}
                    placeholder="Resource title"
                  />
                  <Select value={editResourceCategory} onValueChange={setEditResourceCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="books">📚 Books & Study Materials</SelectItem>
                      <SelectItem value="stationery">✏️ Stationery & Supplies</SelectItem>
                      <SelectItem value="electronics">💻 Electronics & Gadgets</SelectItem>
                      <SelectItem value="courses">🎓 Online Courses & Subscriptions</SelectItem>
                      <SelectItem value="mentorship">👨‍🏫 Mentorship & Guidance</SelectItem>
                      <SelectItem value="scholarships">💰 Scholarships & Financial Aid</SelectItem>
                      <SelectItem value="internships">🏢 Internship Opportunities</SelectItem>
                      <SelectItem value="software">⚡ Software & Tools</SelectItem>
                      <SelectItem value="other">🎁 Other Resources</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    value={editResourceContact}
                    onChange={(e) => setEditResourceContact(e.target.value)}
                    placeholder="Contact information"
                  />
                </>
              )}
              <Button onClick={handleUpdatePost} className="w-full">
                Update Post
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}