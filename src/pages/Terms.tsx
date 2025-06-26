
import React from 'react';
import { Shield, AlertTriangle, FileText, Scale } from 'lucide-react';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-xsm-black to-xsm-dark-gray py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-xsm-yellow mb-4">Terms and Conditions</h1>
          <p className="text-xl text-white">
            Please read these terms carefully before using XSM Market
          </p>
          <div className="text-sm text-xsm-light-gray mt-4">
            Last updated: June 26, 2025
          </div>
        </div>

        <div className="space-y-8">
          {/* Introduction */}
          <div className="xsm-card">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="w-6 h-6 text-xsm-yellow" />
              <h2 className="text-2xl font-bold text-xsm-yellow">Introduction</h2>
            </div>
            <div className="text-white space-y-4">
              <p>
                Welcome to XSM Market ("we," "our," or "us"). These Terms and Conditions ("Terms") govern your use of our website and services for buying and selling YouTube channels.
              </p>
              <p>
                By accessing or using our platform, you agree to be bound by these Terms. If you disagree with any part of these terms, you may not access our service.
              </p>
            </div>
          </div>

          {/* Service Description */}
          <div className="xsm-card">
            <h2 className="text-2xl font-bold text-xsm-yellow mb-4">Service Description</h2>
            <div className="text-white space-y-4">
              <p>
                XSM Market is a marketplace platform that facilitates the buying and selling of YouTube channels between users. We provide:
              </p>
              <ul className="list-disc list-inside space-y-2 text-xsm-light-gray ml-4">
                <li>A platform for listing YouTube channels for sale</li>
                <li>Escrow services to secure transactions</li>
                <li>Verification services for channel authenticity</li>
                <li>Communication tools between buyers and sellers</li>
                <li>Transaction facilitation and support</li>
              </ul>
            </div>
          </div>

          {/* User Responsibilities */}
          <div className="xsm-card">
            <h2 className="text-2xl font-bold text-xsm-yellow mb-4">User Responsibilities</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">For Sellers</h3>
                <ul className="list-disc list-inside space-y-2 text-xsm-light-gray ml-4">
                  <li>You must own the YouTube channel you're selling</li>
                  <li>Provide accurate and truthful information about your channel</li>
                  <li>Ensure compliance with YouTube's Terms of Service</li>
                  <li>Transfer full ownership rights upon completion of sale</li>
                  <li>Cooperate with our verification process</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">For Buyers</h3>
                <ul className="list-disc list-inside space-y-2 text-xsm-light-gray ml-4">
                  <li>Conduct due diligence before purchasing</li>
                  <li>Pay all required fees and charges</li>
                  <li>Comply with YouTube's Terms of Service post-purchase</li>
                  <li>Use our escrow system for all transactions</li>
                  <li>Report any issues promptly to our support team</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Transaction Process */}
          <div className="xsm-card">
            <h2 className="text-2xl font-bold text-xsm-yellow mb-4">Transaction Process</h2>
            <div className="text-white space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Escrow Process</h3>
                <ol className="list-decimal list-inside space-y-2 text-xsm-light-gray ml-4">
                  <li>Buyer pays 7.5% admin fee to initiate transaction</li>
                  <li>Seller transfers channel ownership to XSM Market</li>
                  <li>XSM Market verifies channel transfer and ownership</li>
                  <li>Buyer pays remaining amount to seller</li>
                  <li>XSM Market transfers channel to buyer</li>
                  <li>Transaction is completed and rated</li>
                </ol>
              </div>
              
              <div className="bg-xsm-black/50 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-white font-semibold mb-1">Important:</p>
                    <p className="text-xsm-light-gray">
                      All transactions must go through our escrow system. Direct payments between users are prohibited and not protected.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fees and Payments */}
          <div className="xsm-card">
            <h2 className="text-2xl font-bold text-xsm-yellow mb-4">Fees and Payments</h2>
            <div className="text-white space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Fee Structure</h3>
                <ul className="list-disc list-inside space-y-2 text-xsm-light-gray ml-4">
                  <li>Admin fee: 7.5% of transaction value (paid by buyer to initiate)</li>
                  <li>Listing fee: Free for basic listings, premium options available</li>
                  <li>Payment processing fees as applicable</li>
                  <li>All fees are non-refundable unless transaction fails due to our error</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Payment Methods</h3>
                <p className="text-xsm-light-gray">
                  We accept major credit cards, PayPal, and bank transfers. All payments are processed securely through encrypted channels.
                </p>
              </div>
            </div>
          </div>

          {/* Prohibited Activities */}
          <div className="xsm-card">
            <h2 className="text-2xl font-bold text-xsm-yellow mb-4">Prohibited Activities</h2>
            <div className="text-white space-y-4">
              <p>Users are strictly prohibited from:</p>
              <ul className="list-disc list-inside space-y-2 text-xsm-light-gray ml-4">
                <li>Selling channels you don't own or have rights to</li>
                <li>Providing false or misleading information</li>
                <li>Bypassing our escrow system</li>
                <li>Harassing other users</li>
                <li>Engaging in fraudulent activities</li>
                <li>Violating YouTube's Terms of Service</li>
                <li>Creating multiple accounts to circumvent restrictions</li>
                <li>Attempting to manipulate ratings or reviews</li>
              </ul>
            </div>
          </div>

          {/* Dispute Resolution */}
          <div className="xsm-card">
            <div className="flex items-center space-x-3 mb-4">
              <Scale className="w-6 h-6 text-xsm-yellow" />
              <h2 className="text-2xl font-bold text-xsm-yellow">Dispute Resolution</h2>
            </div>
            <div className="text-white space-y-4">
              <p>
                In case of disputes between buyers and sellers, XSM Market will act as a mediator. Our decision in disputes is final and binding.
              </p>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Dispute Process</h3>
                <ol className="list-decimal list-inside space-y-2 text-xsm-light-gray ml-4">
                  <li>Report the issue through our support system</li>
                  <li>Provide all relevant documentation and evidence</li>
                  <li>Our team will investigate within 48 hours</li>
                  <li>Both parties will be contacted for statements</li>
                  <li>A resolution will be provided within 5 business days</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Liability and Warranties */}
          <div className="xsm-card">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-6 h-6 text-xsm-yellow" />
              <h2 className="text-2xl font-bold text-xsm-yellow">Liability and Warranties</h2>
            </div>
            <div className="text-white space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Disclaimers</h3>
                <ul className="list-disc list-inside space-y-2 text-xsm-light-gray ml-4">
                  <li>We provide the platform "as is" without warranties</li>
                  <li>We don't guarantee channel performance post-sale</li>
                  <li>Users are responsible for compliance with YouTube policies</li>
                  <li>We're not liable for indirect or consequential damages</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Limitation of Liability</h3>
                <p className="text-xsm-light-gray">
                  Our total liability for any claims related to the service shall not exceed the total fees paid by you in the 12 months preceding the claim.
                </p>
              </div>
            </div>
          </div>

          {/* Privacy and Data */}
          <div className="xsm-card">
            <h2 className="text-2xl font-bold text-xsm-yellow mb-4">Privacy and Data Protection</h2>
            <div className="text-white space-y-4">
              <p>
                Your privacy is important to us. We collect and use your information as described in our Privacy Policy. By using our service, you consent to the collection and use of your information in accordance with our Privacy Policy.
              </p>
              <p className="text-xsm-light-gray">
                We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </div>
          </div>

          {/* Termination */}
          <div className="xsm-card">
            <h2 className="text-2xl font-bold text-xsm-yellow mb-4">Account Termination</h2>
            <div className="text-white space-y-4">
              <p>
                We reserve the right to suspend or terminate your account at any time for violation of these Terms or for any other reason we deem appropriate.
              </p>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Reasons for Termination</h3>
                <ul className="list-disc list-inside space-y-2 text-xsm-light-gray ml-4">
                  <li>Violation of Terms and Conditions</li>
                  <li>Fraudulent or illegal activities</li>
                  <li>Repeated policy violations</li>
                  <li>Non-payment of fees</li>
                  <li>Harassment of other users</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Changes to Terms */}
          <div className="xsm-card">
            <h2 className="text-2xl font-bold text-xsm-yellow mb-4">Changes to Terms</h2>
            <div className="text-white space-y-4">
              <p>
                We reserve the right to modify these Terms at any time. We will notify users of significant changes via email or platform notification. Continued use of the service after changes constitutes acceptance of the new terms.
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="xsm-card">
            <h2 className="text-2xl font-bold text-xsm-yellow mb-4">Contact Us</h2>
            <div className="text-white space-y-4">
              <p>
                If you have any questions about these Terms and Conditions, please contact us:
              </p>
              <div className="text-xsm-light-gray">
                <p>Email: legal@xsmmarket.com</p>
                <p>Phone: +1 (555) 123-4567</p>
                <p>Address: 123 Digital Ave, Tech City, TC 12345, United States</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
