import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Shield, Lock, Database, UserCheck, Clock, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6 text-white">Privacy Policy</h1>
        <p className="text-gray-300 mb-8">Last Updated: June 25, 2025</p>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold flex items-center text-white">
                <Shield className="mr-2 text-accent" />
                Introduction
              </h2>
            </CardHeader>
            <CardBody className="text-gray-300 space-y-4">
              <p>
                TaskDOM ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our reading companion application and related services (collectively, the "Service").
              </p>
              <p>
                We take your privacy seriously and have designed our Service with your privacy in mind. Please read this Privacy Policy carefully. By accessing or using our Service, you acknowledge that you have read, understood, and agree to be bound by all the terms of this Privacy Policy.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold flex items-center text-white">
                <Database className="mr-2 text-accent" />
                Information We Collect
              </h2>
            </CardHeader>
            <CardBody className="text-gray-300 space-y-4">
              <h3 className="font-semibold text-white">Personal Information</h3>
              <p>
                We may collect personal information that you voluntarily provide when using our Service, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Account information (name, email address, username, password)</li>
                <li>Profile information (display name, profile picture, pronouns, reading preferences)</li>
                <li>User-generated content (reviews, comments, reading progress, bookmarks)</li>
                <li>Voice preferences and settings for the voice assistant feature</li>
              </ul>

              <h3 className="font-semibold text-white mt-6">Usage Information</h3>
              <p>
                We automatically collect certain information about your device and how you interact with our Service, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Device information (device type, operating system, browser type)</li>
                <li>Log data (IP address, access times, pages viewed)</li>
                <li>Reading habits (books read, reading time, progress tracking)</li>
                <li>Feature usage (voice assistant interactions, social sharing, gamification features)</li>
              </ul>

              <h3 className="font-semibold text-white mt-6">Information from Third Parties</h3>
              <p>
                We may receive information about you from third-party services, such as:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Authentication providers (when you sign in using Google)</li>
                <li>Book metadata from Google Books API and Open Library API</li>
                <li>Payment information from Stripe (we do not store your full payment details)</li>
              </ul>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold flex items-center text-white">
                <Lock className="mr-2 text-accent" />
                How We Use Your Information
              </h2>
            </CardHeader>
            <CardBody className="text-gray-300 space-y-4">
              <p>
                We use the information we collect for various purposes, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Providing, maintaining, and improving our Service</li>
                <li>Processing your transactions and managing your account</li>
                <li>Personalizing your experience (book recommendations, voice preferences)</li>
                <li>Tracking your reading progress and habits</li>
                <li>Facilitating social features (book clubs, content sharing)</li>
                <li>Communicating with you about updates, features, and support</li>
                <li>Analyzing usage patterns to improve our Service</li>
                <li>Protecting the security and integrity of our Service</li>
                <li>Complying with legal obligations</li>
              </ul>

              <p className="mt-4">
                The legal bases for processing your information include:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Performance of our contract with you</li>
                <li>Your consent</li>
                <li>Our legitimate interests (such as improving our Service)</li>
                <li>Compliance with legal obligations</li>
              </ul>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold flex items-center text-white">
                <Globe className="mr-2 text-accent" />
                Information Sharing and Disclosure
              </h2>
            </CardHeader>
            <CardBody className="text-gray-300 space-y-4">
              <p>
                We may share your information in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <span className="font-semibold text-white">Service Providers:</span> We may share your information with third-party vendors, service providers, and other business partners who perform services on our behalf, such as:
                  <ul className="list-disc pl-6 mt-2">
                    <li>Supabase (database and authentication)</li>
                    <li>Stripe (payment processing)</li>
                    <li>ElevenLabs (voice generation)</li>
                    <li>Google Books API and Open Library API (book metadata)</li>
                    <li>Netlify (website hosting)</li>
                  </ul>
                </li>
                <li>
                  <span className="font-semibold text-white">Social Sharing:</span> When you choose to share content through our Service, the information you share may be visible to other users or the public, depending on your settings.
                </li>
                <li>
                  <span className="font-semibold text-white">Legal Requirements:</span> We may disclose your information if required to do so by law or in response to valid requests by public authorities.
                </li>
                <li>
                  <span className="font-semibold text-white">Business Transfers:</span> If we are involved in a merger, acquisition, or sale of all or a portion of our assets, your information may be transferred as part of that transaction.
                </li>
                <li>
                  <span className="font-semibold text-white">With Your Consent:</span> We may share your information with third parties when you have given us your consent to do so.
                </li>
              </ul>

              <p className="mt-4">
                We do not sell your personal information to third parties.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold flex items-center text-white">
                <Clock className="mr-2 text-accent" />
                Data Retention and Storage
              </h2>
            </CardHeader>
            <CardBody className="text-gray-300 space-y-4">
              <p>
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
              </p>
              <p>
                Your data is stored on secure servers provided by Supabase, located in the European Union. We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
              <p>
                For users in the European Economic Area (EEA), we ensure that any transfer of personal data outside the EEA is done in accordance with applicable data protection laws, including the use of Standard Contractual Clauses or other appropriate safeguards.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold flex items-center text-white">
                <UserCheck className="mr-2 text-accent" />
                Your Rights and Choices
              </h2>
            </CardHeader>
            <CardBody className="text-gray-300 space-y-4">
              <p>
                Depending on your location, you may have certain rights regarding your personal information, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <span className="font-semibold text-white">Access:</span> You can request a copy of the personal information we hold about you.
                </li>
                <li>
                  <span className="font-semibold text-white">Rectification:</span> You can request that we correct inaccurate or incomplete information about you.
                </li>
                <li>
                  <span className="font-semibold text-white">Deletion:</span> You can request that we delete your personal information in certain circumstances.
                </li>
                <li>
                  <span className="font-semibold text-white">Restriction:</span> You can request that we restrict the processing of your personal information in certain circumstances.
                </li>
                <li>
                  <span className="font-semibold text-white">Data Portability:</span> You can request a copy of your personal information in a structured, commonly used, and machine-readable format.
                </li>
                <li>
                  <span className="font-semibold text-white">Objection:</span> You can object to our processing of your personal information in certain circumstances.
                </li>
                <li>
                  <span className="font-semibold text-white">Withdrawal of Consent:</span> You can withdraw your consent at any time where we rely on consent to process your personal information.
                </li>
              </ul>

              <p className="mt-4">
                You can exercise these rights by contacting us at privacy@taskdom.app. We will respond to your request within 30 days.
              </p>

              <h3 className="font-semibold text-white mt-6">Account Settings</h3>
              <p>
                You can update your account information and preferences at any time by accessing the "Settings" section of your account. This includes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Updating your profile information</li>
                <li>Changing your password</li>
                <li>Adjusting your privacy settings</li>
                <li>Managing notification preferences</li>
                <li>Toggling between SFW (Safe for Work) and NSFW modes</li>
                <li>Customizing voice assistant settings</li>
              </ul>

              <h3 className="font-semibold text-white mt-6">Cookies and Tracking Technologies</h3>
              <p>
                We use cookies and similar tracking technologies to track activity on our Service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold flex items-center text-white">
                <Shield className="mr-2 text-accent" />
                Children's Privacy
              </h2>
            </CardHeader>
            <CardBody className="text-gray-300 space-y-4">
              <p>
                Our Service is not intended for individuals under the age of 18 ("Children"). We do not knowingly collect personally identifiable information from Children. If you are a parent or guardian and you are aware that your Child has provided us with personal information, please contact us. If we become aware that we have collected personal information from Children without verification of parental consent, we take steps to remove that information from our servers.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold flex items-center text-white">
                <Globe className="mr-2 text-accent" />
                International Data Transfers
              </h2>
            </CardHeader>
            <CardBody className="text-gray-300 space-y-4">
              <p>
                Your information may be transferred to — and maintained on — computers located outside of your state, province, country, or other governmental jurisdiction where the data protection laws may differ from those of your jurisdiction.
              </p>
              <p>
                If you are located outside the United States and choose to provide information to us, please note that we transfer the data, including personal data, to the United States and process it there. Your consent to this Privacy Policy followed by your submission of such information represents your agreement to that transfer.
              </p>
              <p>
                We will take all the steps reasonably necessary to ensure that your data is treated securely and in accordance with this Privacy Policy, and no transfer of your personal data will take place to an organization or a country unless there are adequate controls in place, including the security of your data and other personal information.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold flex items-center text-white">
                <Lock className="mr-2 text-accent" />
                Data Security
              </h2>
            </CardHeader>
            <CardBody className="text-gray-300 space-y-4">
              <p>
                We have implemented appropriate technical and organizational measures to protect the security of your personal information. However, please be aware that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
              </p>
              <p>
                Our security measures include:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Encryption of sensitive data at rest and in transit</li>
                <li>Regular security assessments and audits</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Secure development practices</li>
                <li>Regular monitoring for suspicious activities</li>
              </ul>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold flex items-center text-white">
                <Clock className="mr-2 text-accent" />
                Changes to This Privacy Policy
              </h2>
            </CardHeader>
            <CardBody className="text-gray-300 space-y-4">
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top of this Privacy Policy.
              </p>
              <p>
                You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
              </p>
              <p>
                If we make material changes to this Privacy Policy, we will notify you either through the email address you have provided us or by placing a prominent notice on our website.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold flex items-center text-white">
                <UserCheck className="mr-2 text-accent" />
                Contact Us
              </h2>
            </CardHeader>
            <CardBody className="text-gray-300 space-y-4">
              <p>
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>By email: privacy@taskdom.app</li>
                <li>By visiting the contact page on our website: <Link to="/contact" className="text-accent hover:underline">Contact Us</Link></li>
              </ul>
              <p className="mt-4">
                Data Protection Officer:<br />
                TaskDOM Privacy Team<br />
                privacy@taskdom.app
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default PrivacyPolicyPage;