
import React from 'react';
import { Shield, Eye, Lock, Database, Users, AlertCircle } from 'lucide-react';

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-xsm-black to-xsm-dark-gray py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-xsm-yellow mb-4">Privacy Policy</h1>
          <p className="text-xl text-white">
            Your privacy is our priority. Learn how we collect, use, and protect your information.
          </p>
          <div className="text-sm text-xsm-light-gray mt-4">
            Last updated: June 26, 2025
          </div>
        </div>

        <div className="space-y-8">
          {/* Introduction */}
          <div className="xsm-card">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-6 h-6 text-xsm-yellow" />
              <h2 className="text-2xl font-bold text-xsm-yellow">Introduction</h2>
            </div>
            <div className="text-white space-y-4">
              <p>
                XSM Market ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
              </p>
              <p>
                Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
              </p>
            </div>
          </div>

          {/* Information We Collect */}
          <div className="xsm-card">
            <div className="flex items-center space-x-3 mb-4">
              <Database className="w-6 h-6 text-xsm-yellow" />
              <h2 className="text-2xl font-bold text-xsm-yellow">Information We Collect</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Personal Information</h3>
                <p className="text-xsm-light-gray mb-3">
                  We may collect personally identifiable information that you voluntarily provide to us when you:
                </p>
                <ul className="list-disc list-inside space-y-2 text-xsm-light-gray ml-4">
                  <li>Register for an account</li>
                  <li>List a YouTube channel for sale</li>
                  <li>Make a purchase</li>
                  <li>Contact our support team</li>
                  <li>Subscribe to our newsletter</li>
                  <li>Participate in surveys or promotions</li>
                </ul>
                
                <div className="mt-4 bg-xsm-black/50 rounded-lg p-4">
                  <p className="text-sm text-white font-semibold mb-2">This may include:</p>
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-xsm-light-gray">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Name and contact information</li>
                      <li>Email address and phone number</li>
                      <li>Billing and payment information</li>
                      <li>Account credentials</li>
                    </ul>
                    <ul className="list-disc list-inside space-y-1">
                      <li>YouTube channel information</li>
                      <li>Transaction history</li>
                      <li>Communication records</li>
                      <li>Profile preferences</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Automatically Collected Information</h3>
                <p className="text-xsm-light-gray mb-3">
                  When you visit our website, we may automatically collect certain information about your device and usage patterns:
                </p>
                <ul className="list-disc list-inside space-y-2 text-xsm-light-gray ml-4">
                  <li>IP address and location data</li>
                  <li>Browser type and version</li>
                  <li>Operating system information</li>
                  <li>Pages visited and time spent on site</li>
                  <li>Referring website information</li>
                  <li>Cookies and tracking technologies</li>
                </ul>
              </div>
            </div>
          </div>

          {/* How We Use Your Information */}
          <div className="xsm-card">
            <div className="flex items-center space-x-3 mb-4">
              <Eye className="w-6 h-6 text-xsm-yellow" />
              <h2 className="text-2xl font-bold text-xsm-yellow">How We Use Your Information</h2>
            </div>
            
            <div className="text-white space-y-4">
              <p>We use the information we collect for the following purposes:</p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Service Provision</h3>
                  <ul className="list-disc list-inside space-y-2 text-xsm-light-gray text-sm">
                    <li>Create and manage user accounts</li>
                    <li>Process transactions and payments</li>
                    <li>Facilitate channel transfers</li>
                    <li>Provide customer support</li>
                    <li>Verify user identity and prevent fraud</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Platform Improvement</h3>
                  <ul className="list-disc list-inside space-y-2 text-xsm-light-gray text-sm">
                    <li>Analyze usage patterns and trends</li>
                    <li>Improve website functionality</li>
                    <li>Develop new features and services</li>
                    <li>Conduct research and analytics</li>
                    <li>Optimize user experience</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Communication</h3>
                  <ul className="list-disc list-inside space-y-2 text-xsm-light-gray text-sm">
                    <li>Send transaction notifications</li>
                    <li>Provide account updates</li>
                    <li>Share promotional content (with consent)</li>
                    <li>Respond to inquiries and support requests</li>
                    <li>Send security alerts</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Legal Compliance</h3>
                  <ul className="list-disc list-inside space-y-2 text-xsm-light-gray text-sm">
                    <li>Comply with legal obligations</li>
                    <li>Enforce our Terms of Service</li>
                    <li>Investigate suspected violations</li>
                    <li>Cooperate with law enforcement</li>
                    <li>Protect our rights and interests</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Information Sharing */}
          <div className="xsm-card">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="w-6 h-6 text-xsm-yellow" />
              <h2 className="text-2xl font-bold text-xsm-yellow">Information Sharing and Disclosure</h2>
            </div>
            
            <div className="text-white space-y-4">
              <p>
                We do not sell, rent, or trade your personal information to third parties. However, we may share your information in the following circumstances:
              </p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Service Providers</h3>
                  <p className="text-xsm-light-gray text-sm">
                    We may share information with trusted third-party service providers who assist us in operating our platform, such as payment processors, hosting providers, and analytics services.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Legal Requirements</h3>
                  <p className="text-xsm-light-gray text-sm">
                    We may disclose information when required by law, court order, or government regulation, or when we believe disclosure is necessary to protect our rights or comply with legal obligations.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Business Transfers</h3>
                  <p className="text-xsm-light-gray text-sm">
                    In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the business transaction.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">User Consent</h3>
                  <p className="text-xsm-light-gray text-sm">
                    We may share information with your explicit consent or at your direction, such as when you choose to share information with other users through our platform.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Data Security */}
          <div className="xsm-card">
            <div className="flex items-center space-x-3 mb-4">
              <Lock className="w-6 h-6 text-xsm-yellow" />
              <h2 className="text-2xl font-bold text-xsm-yellow">Data Security</h2>
            </div>
            
            <div className="text-white space-y-4">
              <p>
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Security Measures Include:</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="list-disc list-inside space-y-2 text-xsm-light-gray text-sm">
                    <li>SSL/TLS encryption for data transmission</li>
                    <li>Encrypted storage of sensitive information</li>
                    <li>Regular security audits and assessments</li>
                    <li>Access controls and authentication systems</li>
                  </ul>
                  <ul className="list-disc list-inside space-y-2 text-xsm-light-gray text-sm">
                    <li>Employee training on data protection</li>
                    <li>Incident response and breach notification procedures</li>
                    <li>Regular software updates and patches</li>
                    <li>Third-party security certifications</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-white font-semibold mb-1">Important Note:</p>
                    <p className="text-xsm-light-gray">
                      While we strive to protect your information, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security but are committed to protecting your data using industry best practices.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Your Rights and Choices */}
          <div className="xsm-card">
            <h2 className="text-2xl font-bold text-xsm-yellow mb-4">Your Rights and Choices</h2>
            
            <div className="text-white space-y-4">
              <p>You have certain rights regarding your personal information:</p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Access and Portability</h3>
                  <ul className="list-disc list-inside space-y-2 text-xsm-light-gray text-sm">
                    <li>Request access to your personal data</li>
                    <li>Obtain a copy of your information</li>
                    <li>Request data portability</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Correction and Deletion</h3>
                  <ul className="list-disc list-inside space-y-2 text-xsm-light-gray text-sm">
                    <li>Correct inaccurate information</li>
                    <li>Request deletion of your data</li>
                    <li>Withdraw consent for processing</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Communication Preferences</h3>
                  <ul className="list-disc list-inside space-y-2 text-xsm-light-gray text-sm">
                    <li>Opt-out of marketing communications</li>
                    <li>Choose notification preferences</li>
                    <li>Update contact information</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Account Management</h3>
                  <ul className="list-disc list-inside space-y-2 text-xsm-light-gray text-sm">
                    <li>Update account settings</li>
                    <li>Delete your account</li>
                    <li>Control privacy settings</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-xsm-black/50 rounded-lg p-4 mt-6">
                <p className="text-sm text-white font-semibold mb-2">To exercise your rights:</p>
                <p className="text-sm text-xsm-light-gray">
                  Contact us at privacy@xsmmarket.com or through your account settings. We will respond to your request within 30 days.
                </p>
              </div>
            </div>
          </div>

          {/* Cookies and Tracking */}
          <div className="xsm-card">
            <h2 className="text-2xl font-bold text-xsm-yellow mb-4">Cookies and Tracking Technologies</h2>
            
            <div className="text-white space-y-4">
              <p>
                We use cookies and similar tracking technologies to enhance your browsing experience and collect information about how you use our website.
              </p>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Types of Cookies We Use:</h3>
                <div className="space-y-3">
                  <div className="bg-xsm-black/50 rounded-lg p-3">
                    <h4 className="text-white font-semibold text-sm mb-1">Essential Cookies</h4>
                    <p className="text-xsm-light-gray text-sm">Required for basic website functionality and security</p>
                  </div>
                  <div className="bg-xsm-black/50 rounded-lg p-3">
                    <h4 className="text-white font-semibold text-sm mb-1">Analytics Cookies</h4>
                    <p className="text-xsm-light-gray text-sm">Help us understand how visitors interact with our website</p>
                  </div>
                  <div className="bg-xsm-black/50 rounded-lg p-3">
                    <h4 className="text-white font-semibold text-sm mb-1">Functional Cookies</h4>
                    <p className="text-xsm-light-gray text-sm">Remember your preferences and provide enhanced features</p>
                  </div>
                  <div className="bg-xsm-black/50 rounded-lg p-3">
                    <h4 className="text-white font-semibold text-sm mb-1">Marketing Cookies</h4>
                    <p className="text-xsm-light-gray text-sm">Used to deliver relevant advertisements (with your consent)</p>
                  </div>
                </div>
              </div>
              
              <p className="text-xsm-light-gray text-sm">
                You can control cookie preferences through your browser settings. However, disabling certain cookies may affect website functionality.
              </p>
            </div>
          </div>

          {/* Data Retention */}
          <div className="xsm-card">
            <h2 className="text-2xl font-bold text-xsm-yellow mb-4">Data Retention</h2>
            
            <div className="text-white space-y-4">
              <p>
                We retain your personal information only as long as necessary to fulfill the purposes outlined in this privacy policy, unless a longer retention period is required by law.
              </p>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Retention Periods:</h3>
                <ul className="list-disc list-inside space-y-2 text-xsm-light-gray text-sm ml-4">
                  <li>Account information: Until account deletion or 3 years of inactivity</li>
                  <li>Transaction records: 7 years for legal and tax purposes</li>
                  <li>Communication logs: 2 years from last contact</li>
                  <li>Analytics data: 2 years in anonymized form</li>
                  <li>Legal compliance data: As required by applicable law</li>
                </ul>
              </div>
            </div>
          </div>

          {/* International Transfers */}
          <div className="xsm-card">
            <h2 className="text-2xl font-bold text-xsm-yellow mb-4">International Data Transfers</h2>
            
            <div className="text-white space-y-4">
              <p>
                Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your information in accordance with this privacy policy.
              </p>
              <p className="text-xsm-light-gray text-sm">
                We comply with applicable data protection laws regarding international transfers, including implementing standard contractual clauses and ensuring adequate levels of protection.
              </p>
            </div>
          </div>

          {/* Children's Privacy */}
          <div className="xsm-card">
            <h2 className="text-2xl font-bold text-xsm-yellow mb-4">Children's Privacy</h2>
            
            <div className="text-white space-y-4">
              <p>
                Our service is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If we discover that a child under 13 has provided us with personal information, we will delete such information immediately.
              </p>
              <p className="text-xsm-light-gray text-sm">
                If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
              </p>
            </div>
          </div>

          {/* Changes to This Policy */}
          <div className="xsm-card">
            <h2 className="text-2xl font-bold text-xsm-yellow mb-4">Changes to This Privacy Policy</h2>
            
            <div className="text-white space-y-4">
              <p>
                We may update this privacy policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons. We will notify you of any material changes by:
              </p>
              <ul className="list-disc list-inside space-y-2 text-xsm-light-gray text-sm ml-4">
                <li>Posting the updated policy on our website</li>
                <li>Sending email notifications to registered users</li>
                <li>Displaying prominent notices on our platform</li>
              </ul>
              <p className="text-xsm-light-gray text-sm">
                Your continued use of our service after the effective date of the revised policy constitutes acceptance of the changes.
              </p>
            </div>
          </div>

          {/* Contact Us */}
          <div className="xsm-card">
            <h2 className="text-2xl font-bold text-xsm-yellow mb-4">Contact Us</h2>
            
            <div className="text-white space-y-4">
              <p>
                If you have any questions, concerns, or requests regarding this privacy policy or our data practices, please contact us:
              </p>
              
              <div className="bg-xsm-black/50 rounded-lg p-4">
                <div className="text-xsm-light-gray space-y-2">
                  <p><strong className="text-white">Email:</strong> privacy@xsmmarket.com</p>
                  <p><strong className="text-white">Phone:</strong> +1 (555) 123-4567</p>
                  <p><strong className="text-white">Mail:</strong> XSM Market Privacy Team<br />
                     123 Digital Ave<br />
                     Tech City, TC 12345<br />
                     United States</p>
                </div>
              </div>
              
              <p className="text-xsm-light-gray text-sm">
                We will respond to your inquiry within 30 days and work with you to resolve any privacy-related concerns.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
