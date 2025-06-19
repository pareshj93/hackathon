import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Heart, BookOpen, Award } from 'lucide-react';

export default function RightSidebar() {
  return (
    <div className="space-y-4 sticky top-24">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
            About SikshaSetu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            A trusted community platform connecting donors and verified students to share educational resources and knowledge.
          </p>
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <Users className="w-4 h-4 mr-2 text-blue-600" />
              <span className="text-gray-600">Community-driven learning</span>
            </div>
            <div className="flex items-center text-sm">
              <Award className="w-4 h-4 mr-2 text-green-600" />
              <span className="text-gray-600">Verified student network</span>
            </div>
            <div className="flex items-center text-sm">
              <Heart className="w-4 h-4 mr-2 text-red-600" />
              <span className="text-gray-600">Supporting education equality</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Community Impact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Students</span>
              <Badge variant="secondary">250+</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Resources Shared</span>
              <Badge variant="secondary">1,200+</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Verified Donors</span>
              <Badge variant="secondary">150+</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Success Stories</span>
              <Badge variant="secondary">50+</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Supported By</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">S</span>
              </div>
              <span className="text-sm font-medium">Supabase</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">N</span>
              </div>
              <span className="text-sm font-medium">Netlify</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">E</span>
              </div>
              <span className="text-sm font-medium">Education Partners</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}