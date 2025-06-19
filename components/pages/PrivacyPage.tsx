import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, Lock, UserCheck } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Shield className="w-8 h-8 mr-3 text-blue-600" />
            Privacy Policy
          </CardTitle>
        </CardHeader>
        <CardContent className="prose max-w-none">
          <p className="text-gray-600 mb-6">
            Last updated: December 2024
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="flex items-center text-xl font-semibold mb-4">
                <Eye className="w-5 h-5 mr-2 text-blue-600" />
                Information We Collect
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>We collect information you provide directly to us, including:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Account information (email, username, role selection)</li>
                  <li>Profile information and verification documents</li>
                  <li>Content you post (wisdom posts, resource donations)</li>
                  <li>Communications with our support team</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="flex items-center text-xl font-semibold mb-4">
                <UserCheck className="w-5 h-5 mr-2 text-green-600" />
                Student Verification
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>For student verification, we collect and process:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Student ID card images for verification purposes</li>
                  <li>Educational institution information visible on ID cards</li>
                  <li>Student status confirmation</li>
                </ul>
                <p>
                  <strong>Important:</strong> Verification documents are used solely for identity confirmation 
                  and maintaining community trust. We do not share this information with third parties 
                  and follow strict data protection protocols.
                </p>
              </div>
            </section>

            <section>
              <h2 className="flex items-center text-xl font-semibold mb-4">
                <Lock className="w-5 h-5 mr-2 text-red-600" />
                How We Use Your Information
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>We use collected information to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide and maintain our platform services</li>
                  <li>Verify student status and maintain community trust</li>
                  <li>Enable secure communication between donors and students</li>
                  <li>Prevent fraud and ensure platform safety</li>
                  <li>Improve our services and user experience</li>
                  <li>Send important account and service notifications</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">Data Security</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We implement appropriate technical and organizational measures to protect your personal 
                  information against unauthorized access, alteration, disclosure, or destruction. This includes:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Encrypted data transmission and storage</li>
                  <li>Secure authentication systems</li>
                  <li>Regular security audits and updates</li>
                  <li>Restricted access to personal information</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">Information Sharing</h2>
              <div className="space-y-4 text-gray-700">
                <p>We do not sell, trade, or otherwise transfer your personal information to third parties, except:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>With your explicit consent</li>
                  <li>To comply with legal obligations</li>
                  <li>To protect our rights and safety</li>
                  <li>With trusted service providers who assist in platform operations</li>
                </ul>
                <p>
                  <strong>Note:</strong> Public posts and profile information (username, role, verification status) 
                  are visible to all platform users as part of the community experience.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">Your Rights</h2>
              <div className="space-y-4 text-gray-700">
                <p>You have the right to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Access and update your personal information</li>
                  <li>Delete your account and associated data</li>
                  <li>Opt out of non-essential communications</li>
                  <li>Request information about data we collect and process</li>
                  <li>File a complaint with relevant data protection authorities</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  If you have questions about this Privacy Policy or our data practices, 
                  please contact us at: <strong>privacy@sikshasetu.com</strong>
                </p>
                <p>
                  We are committed to resolving any privacy concerns and will respond to 
                  all inquiries within 72 hours.
                </p>
              </div>
            </section>

            <section className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">User Consent</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  By using SikshaSetu, you consent to the collection and processing of your 
                  information as described in this Privacy Policy. For student verification, 
                  you specifically consent to the processing of your student ID information 
                  for verification purposes.
                </p>
                <p>
                  You may withdraw your consent at any time by deleting your account, 
                  though this will prevent you from using our services.
                </p>
              </div>
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}