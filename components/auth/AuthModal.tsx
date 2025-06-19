'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { signUp, signIn } from '@/lib/auth';
import { toast } from 'sonner';
import { GraduationCap, Heart, CheckCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'donor'>('student');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password, role);
        
        handleClose();
        
        setTimeout(() => {
          toast.success(
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">Registration Successful!</p>
                <p className="text-sm text-gray-600 mt-1">
                  Welcome to SikshaSetu as a <span className="font-medium capitalize">{role}</span>! 
                  {role === 'donor' 
                    ? ' You can start sharing resources immediately.'
                    : ' Please check your inbox and verify your email to complete setup.'
                  }
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  {role === 'donor' 
                    ? 'You have full access to all features as a verified donor.'
                    : 'You can start using the platform immediately while verification is pending.'
                  }
                </p>
              </div>
            </div>,
            { 
              duration: 8000,
              style: {
                maxWidth: '500px',
              }
            }
          );
        }, 300);
        
      } else {
        await signIn(email, password);
        
        handleClose();
        
        setTimeout(() => {
          toast.success('Welcome back to SikshaSetu!');
        }, 300);
      }
      
      onSuccess();
      
    } catch (error: any) {
      console.error('Auth error:', error);
      
      let errorMessage = 'Authentication failed';
      if (error.message) {
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password';
        } else if (error.message.includes('User already registered')) {
          errorMessage = 'An account with this email already exists. Try signing in instead.';
          setIsSignUp(false);
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and confirm your account';
        } else if (error.message.includes('duplicate key value')) {
          errorMessage = 'An account with this email already exists. Try signing in instead.';
          setIsSignUp(false);
        } else if (error.message.includes('Please connect to Supabase')) {
          errorMessage = 'Database connection required. Please connect to Supabase first.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setRole('student');
    setIsSignUp(true);
    setLoading(false);
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            {isSignUp ? 'Join SikshaSetu' : 'Welcome Back'}
          </DialogTitle>
          <p className="text-center text-sm text-gray-600">
            {isSignUp 
              ? 'Create your account to start sharing and learning' 
              : 'Sign in to continue your learning journey'
            }
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
              minLength={6}
              className="w-full"
            />
            {isSignUp && (
              <p className="text-xs text-gray-500">Password must be at least 6 characters</p>
            )}
          </div>
          
          {isSignUp && (
            <div className="space-y-3">
              <Label className="text-base font-medium">Choose your role:</Label>
              <RadioGroup 
                value={role} 
                onValueChange={(value) => setRole(value as 'student' | 'donor')}
                disabled={loading}
                className="space-y-3"
              >
                <div 
                  className={`flex items-start space-x-3 p-4 border-2 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer ${role === 'student' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                  onClick={() => !loading && setRole('student')}
                >
                  <RadioGroupItem value="student" id="student" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="student" className="cursor-pointer font-medium flex items-center">
                      <GraduationCap className="w-4 h-4 mr-2 text-blue-600" />
                      Student
                    </Label>
                    <p className="text-xs text-gray-600 mt-1">
                      Looking for educational resources, mentorship, and community support
                    </p>
                    <p className="text-xs text-blue-600 mt-1 font-medium">
                      • Can post immediately • Get verified for resource claiming
                    </p>
                  </div>
                </div>
                <div 
                  className={`flex items-start space-x-3 p-4 border-2 rounded-lg hover:bg-green-50 transition-colors cursor-pointer ${role === 'donor' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                  onClick={() => !loading && setRole('donor')}
                >
                  <RadioGroupItem value="donor" id="donor" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="donor" className="cursor-pointer font-medium flex items-center">
                      <Heart className="w-4 h-4 mr-2 text-green-600" />
                      Donor / Mentor
                    </Label>
                    <p className="text-xs text-gray-600 mt-1">
                      Sharing knowledge, resources, and mentoring students
                    </p>
                    <p className="text-xs text-green-600 mt-1 font-medium">
                      • Full access immediately • Automatically verified
                    </p>
                  </div>
                </div>
              </RadioGroup>
              
              <div className="text-xs text-center p-2 bg-gray-50 rounded">
                <span className="font-medium">Currently selected: </span>
                <span className={`capitalize font-bold ${role === 'student' ? 'text-blue-600' : 'text-green-600'}`}>
                  {role}
                </span>
              </div>
            </div>
          )}
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isSignUp ? 'Creating Account...' : 'Signing In...'}
              </div>
            ) : (
              isSignUp ? 'Create Account' : 'Sign In'
            )}
          </Button>
          
          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-blue-600 hover:underline"
              disabled={loading}
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}