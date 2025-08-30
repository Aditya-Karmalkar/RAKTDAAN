import { motion } from "framer-motion";
import { Shield, Lock, Eye, UserCheck, FileText, AlertTriangle } from "lucide-react";

export function PrivacyPolicy() {
  const sections = [
    {
      id: "information-collection",
      title: "Information We Collect",
      icon: <FileText className="w-6 h-6" />,
      content: [
        {
          subtitle: "Personal Information",
          text: "We collect personal information when you register as a donor or hospital, including name, contact details, blood type, medical history relevant to donation, and location information."
        },
        {
          subtitle: "Usage Data",
          text: "We automatically collect information about how you use our platform, including IP address, browser type, device information, and interaction patterns to improve our services."
        },
        {
          subtitle: "Location Data",
          text: "With your consent, we collect location data to match you with nearby donation opportunities and emergency requests. You can disable location sharing at any time."
        }
      ]
    },
    {
      id: "data-usage",
      title: "How We Use Your Data",
      icon: <UserCheck className="w-6 h-6" />,
      content: [
        {
          subtitle: "Donation Matching",
          text: "We use your blood type, location, and availability to match you with compatible donation requests from verified hospitals and medical facilities."
        },
        {
          subtitle: "Emergency Notifications",
          text: "During critical blood shortages, we may send urgent notifications to eligible donors in the affected area to facilitate life-saving donations."
        },
        {
          subtitle: "Platform Improvement",
          text: "We analyze usage patterns and feedback to enhance our platform's functionality, user experience, and effectiveness in connecting donors with recipients."
        },
        {
          subtitle: "Communication",
          text: "We send important updates about donation opportunities, platform changes, safety information, and responses to your inquiries."
        }
      ]
    },
    {
      id: "data-sharing",
      title: "Data Sharing and Disclosure",
      icon: <Eye className="w-6 h-6" />,
      content: [
        {
          subtitle: "Verified Hospitals",
          text: "We share necessary donor information (name, contact details, blood type) with verified hospitals only when you consent to a specific donation request."
        },
        {
          subtitle: "Emergency Situations",
          text: "In life-threatening emergencies, we may share donor contact information with authorized medical personnel to facilitate immediate blood donation."
        },
        {
          subtitle: "Legal Requirements",
          text: "We may disclose information when required by law, court order, or to protect the rights, property, or safety of RaktDaan, our users, or the public."
        },
        {
          subtitle: "Third-Party Services",
          text: "We use trusted third-party services for hosting, analytics, and communications. These providers are bound by strict confidentiality agreements."
        }
      ]
    },
    {
      id: "data-security",
      title: "Data Security",
      icon: <Lock className="w-6 h-6" />,
      content: [
        {
          subtitle: "Encryption",
          text: "All personal data is encrypted both in transit and at rest using industry-standard encryption protocols to protect against unauthorized access."
        },
        {
          subtitle: "Access Controls",
          text: "We implement strict access controls, ensuring only authorized personnel can access personal data, and all access is logged and monitored."
        },
        {
          subtitle: "Regular Audits",
          text: "We conduct regular security audits and vulnerability assessments to identify and address potential security risks promptly."
        },
        {
          subtitle: "Data Backup",
          text: "We maintain secure, encrypted backups of essential data to ensure service continuity while protecting user privacy."
        }
      ]
    },
    {
      id: "user-rights",
      title: "Your Rights and Choices",
      icon: <Shield className="w-6 h-6" />,
      content: [
        {
          subtitle: "Access and Correction",
          text: "You can access, review, and update your personal information at any time through your account dashboard or by contacting our support team."
        },
        {
          subtitle: "Data Deletion",
          text: "You may request deletion of your account and personal data. We will retain some information as required by law or for legitimate business purposes."
        },
        {
          subtitle: "Consent Withdrawal",
          text: "You can withdraw consent for specific data uses, such as location tracking or marketing communications, without affecting other services."
        },
        {
          subtitle: "Data Portability",
          text: "You have the right to receive your personal data in a structured, machine-readable format for transfer to another service."
        }
      ]
    },
    {
      id: "data-retention",
      title: "Data Retention",
      icon: <AlertTriangle className="w-6 h-6" />,
      content: [
        {
          subtitle: "Active Accounts",
          text: "We retain personal data for active donor and hospital accounts as long as the account remains active and for legitimate business purposes."
        },
        {
          subtitle: "Inactive Accounts",
          text: "Data from inactive accounts (no activity for 2+ years) may be archived or deleted after appropriate notice to the account holder."
        },
        {
          subtitle: "Legal Requirements",
          text: "Some data may be retained longer to comply with legal obligations, resolve disputes, or enforce our agreements."
        },
        {
          subtitle: "Donation Records",
          text: "Anonymized donation statistics may be retained indefinitely for research and public health purposes, with all personal identifiers removed."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white py-16">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Your privacy is fundamental to our mission. This policy explains how we collect, 
            use, and protect your personal information while facilitating life-saving blood donations.
          </p>
          <div className="mt-6 text-sm text-gray-500">
            <p>Last updated: December 2024</p>
          </div>
        </motion.div>

        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-4xl mx-auto mb-12"
        >
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Commitment to Privacy</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              RaktDaan is committed to protecting your privacy and maintaining the confidentiality of your personal information. 
              As a platform that handles sensitive health and personal data, we implement the highest standards of data protection 
              and comply with applicable privacy laws and regulations.
            </p>
            <p className="text-gray-700 leading-relaxed">
              This Privacy Policy applies to all users of the RaktDaan platform, including blood donors, hospitals, 
              medical facilities, and website visitors. By using our services, you agree to the collection and use of 
              information in accordance with this policy.
            </p>
          </div>
        </motion.div>

        {/* Policy Sections */}
        <div className="max-w-4xl mx-auto space-y-8">
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <div className="bg-red-600 text-white p-6">
                <div className="flex items-center">
                  <div className="mr-4">
                    {section.icon}
                  </div>
                  <h2 className="text-2xl font-bold">{section.title}</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {section.content.map((item, itemIndex) => (
                    <div key={itemIndex}>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {item.subtitle}
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Us About Privacy</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Questions</h3>
                <p className="text-gray-700 mb-4">
                  If you have questions about this Privacy Policy or how we handle your personal information, 
                  please contact our Privacy Officer:
                </p>
                <div className="space-y-2 text-gray-600">
                  <p><strong>Email:</strong> privacy@raktdaan.org</p>
                  <p><strong>Phone:</strong> +91 8XX-Rakt-Daan</p>
                  <p><strong>Address:</strong> RaktDaan Privacy Office, India</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Protection Rights</h3>
                <p className="text-gray-700 mb-4">
                  To exercise your data protection rights or file a privacy complaint:
                </p>
                <div className="space-y-2 text-gray-600">
                  <p><strong>Data Protection Officer:</strong> dpo@raktdaan.org</p>
                  <p><strong>Response Time:</strong> Within 30 days</p>
                  <p><strong>Escalation:</strong> Relevant data protection authority</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Updates Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-8 max-w-4xl mx-auto"
        >
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-start">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-red-900 mb-2">Policy Updates</h3>
                <p className="text-red-800">
                  We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements. 
                  We will notify users of significant changes via email or platform notification. Continued use of our services 
                  after updates constitutes acceptance of the revised policy.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
