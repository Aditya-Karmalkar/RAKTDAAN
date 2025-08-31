import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import SimpleImageUpload from "./SimpleImageUpload";
import FirebaseImageUpload from "./FirebaseImageUpload";
import { useNotifications } from "../hooks/useNotifications";
import { 
  subscribeToChannels, 
  createChatChannel, 
  sendMessage,
  subscribeToChannelMessages,
  ChatChannel,
  ChatMessage
} from "../firebase/chat";

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [showChannelForm, setShowChannelForm] = useState(false);
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [showPhotoForm, setShowPhotoForm] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [realTimeData, setRealTimeData] = useState<any>(null);
  
  // Firebase chat state - replacing Convex chat
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<ChatChannel | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  // Channel form state
  const [newChannelData, setNewChannelData] = useState({
    name: '',
    description: '',
    type: 'public' as 'public' | 'private'
  });
  
  // Notifications
  const { showSuccess, showError, showInfo } = useNotifications();

  // Queries
  const users = useQuery(api.admin.getAllUsersWithVerification);
  const hospitals = useQuery(api.admin.getAllHospitals);
  const donors = useQuery(api.admin.getAllDonorsWithVerification);
  const sosAlerts = useQuery(api.admin.getAllSosAlerts);
  const testimonials = useQuery(api.admin.getAllTestimonials);
  const contacts = useQuery(api.admin.getAllContactMessages);
  const teamMembers = useQuery(api.teams.getAllTeamMembers);
  // Removed Convex chatChannels query - now using Firebase
  const campaigns = useQuery(api.campaigns.getAllCampaigns);
  const galleryPhotos = useQuery(api.gallery.getAllPhotos);
  const realTimeAnalytics = useQuery(api.admin.getRealTimeAnalytics);
  const campaignAnalytics = useQuery(api.campaigns.getCampaignAnalytics);
  const galleryAnalytics = useQuery(api.gallery.getGalleryAnalytics);

  // Mutations (removed Convex chat mutations since we're using Firebase)
  const deleteUser = useMutation(api.admin.deleteUser);
  const deleteHospital = useMutation(api.admin.deleteHospital);
  const updateSosAlert = useMutation(api.admin.updateSosAlertStatus);
  const updateTestimonial = useMutation(api.admin.updateTestimonialStatus);
  const updateContact = useMutation(api.admin.updateContactMessageStatus);
  const createTeamMember = useMutation(api.teams.createTeamMember);
  const verifyUser = useMutation(api.admin.verifyUser);
  const verifyHospital = useMutation(api.admin.verifyHospital);
  const verifyDonor = useMutation(api.admin.verifyDonor);
  const rejectDonorVerification = useMutation(api.admin.rejectDonorVerification);
  const unverifyUser = useMutation(api.admin.unverifyUser);
  const unverifyHospital = useMutation(api.admin.unverifyHospital);
  const createCampaign = useMutation(api.campaigns.createCampaign);
  const updateCampaign = useMutation(api.campaigns.updateCampaign);
  const deleteCampaign = useMutation(api.campaigns.deleteCampaign);
  const uploadPhoto = useMutation(api.gallery.uploadPhoto);
  const deletePhoto = useMutation(api.gallery.deletePhoto);

  // Team form state
  const [teamForm, setTeamForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "coordinator",
    department: "",
    phone: "",
    bio: ""
  });

  // Campaign form state
  const [campaignForm, setCampaignForm] = useState({
    title: "",
    description: "",
    shortDescription: "",
    imageUrl: "",
    bannerImageUrl: "",
    targetBloodType: "",
    targetLocation: "",
    targetGoal: 0,
    startDate: "",
    endDate: "",
    priority: "medium",
    organizingHospital: "",
    contactInfo: {
      phone: "",
      email: "",
      address: "",
    },
    requirements: [] as string[],
    benefits: [] as string[],
  });

  // Photo form state
  const [photoForm, setPhotoForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    category: "donation_drive",
    tags: [] as string[],
  });

  // Real-time updates
  useEffect(() => {
    if (realTimeAnalytics) {
      setRealTimeData(realTimeAnalytics);
    }
  }, [realTimeAnalytics]);

  // Auto-refresh real-time data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Trigger re-fetch of real-time analytics
      if (realTimeAnalytics) {
        setRealTimeData(realTimeAnalytics);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [realTimeAnalytics]);

  // Subscribe to Firebase chat channels
  // Initialize Firebase chat channels
  useEffect(() => {
    const unsubscribe = subscribeToChannels((fetchedChannels) => {
      setChannels(fetchedChannels);
      showInfo('Channels Loaded', 'Firebase chat channels loaded successfully');
    });

    return () => unsubscribe();
  }, [showInfo]);

  // Subscribe to messages when a channel is selected
  useEffect(() => {
    if (!selectedChannel?.id) {
      setMessages([]);
      return;
    }

    const unsubscribe = subscribeToChannelMessages(selectedChannel.id, (fetchedMessages) => {
      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, [selectedChannel?.id]);

  const handleCreateTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await (createTeamMember as any)(teamForm);
      alert("Team member created successfully!");
      setTeamForm({
        name: "",
        email: "",
        password: "",
        role: "coordinator",
        department: "",
        phone: "",
        bio: ""
      });
      setShowTeamForm(false);
    } catch (error) {
      console.error("Error creating team member:", error);
      alert(`Failed to create team member: ${error}`);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await (createCampaign as any)({
        ...campaignForm,
        startDate: new Date(campaignForm.startDate).getTime(),
        endDate: new Date(campaignForm.endDate).getTime(),
        targetGoal: Number(campaignForm.targetGoal),
      });
      alert("Campaign created successfully!");
      setCampaignForm({
        title: "",
        description: "",
        shortDescription: "",
        imageUrl: "",
        bannerImageUrl: "",
        targetBloodType: "",
        targetLocation: "",
        targetGoal: 0,
        startDate: "",
        endDate: "",
        priority: "medium",
        organizingHospital: "",
        contactInfo: { phone: "", email: "", address: "" },
        requirements: [],
        benefits: [],
      });
      setShowCampaignForm(false);
    } catch (error) {
      console.error("Error creating campaign:", error);
      alert(`Failed to create campaign: ${error}`);
    }
  };

  const handleUploadPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await (uploadPhoto as any)(photoForm);
      alert("Photo uploaded successfully!");
      setPhotoForm({
        title: "",
        description: "",
        imageUrl: "",
        category: "donation_drive",
        tags: [],
      });
      setShowPhotoForm(false);
    } catch (error) {
      console.error("Error uploading photo:", error);
      alert(`Failed to upload photo: ${error}`);
    }
  };

  const handleVerifyDonor = async (donorId: Id<"donors">) => {
    try {
      await (verifyDonor as any)({ donorId, verificationNotes: "Verified by admin" });
      alert("Donor verified successfully!");
    } catch (error) {
      alert("Failed to verify donor");
    }
  };

  const handleRejectDonor = async (donorId: Id<"donors">) => {
    const reason = prompt("Please provide a reason for rejection:");
    if (reason) {
      try {
        await (rejectDonorVerification as any)({ 
          donorId, 
          rejectionReason: reason,
          verificationNotes: "Rejected by admin"
        });
        alert("Donor verification rejected!");
      } catch (error) {
        alert("Failed to reject donor verification");
      }
    }
  };

  const handleDeleteCampaign = async (campaignId: Id<"campaigns">) => {
    if (confirm("Are you sure you want to delete this campaign?")) {
      try {
        await (deleteCampaign as any)({ campaignId });
        alert("Campaign deleted successfully!");
      } catch (error) {
        alert("Failed to delete campaign");
      }
    }
  };

  const handleDeletePhoto = async (photoId: Id<"gallery">) => {
    if (confirm("Are you sure you want to delete this photo?")) {
      try {
        await (deletePhoto as any)({ photoId });
        alert("Photo deleted successfully!");
      } catch (error) {
        alert("Failed to delete photo");
      }
    }
  };

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!users || users.length === 0) {
      showError('No User Found', 'Please ensure you are logged in as an admin user');
      return;
    }

    const currentUser = users[0]; // Assuming first user is current admin
    
    try {
      const channelId = await createChatChannel(
        newChannelData.name,
        newChannelData.description,
        newChannelData.type,
        currentUser._id
      );

      showSuccess('Channel Created!', `Firebase chat channel "${newChannelData.name}" has been created successfully`);
      setShowChannelForm(false);
      
      // Clear form
      setNewChannelData({
        name: '',
        description: '',
        type: 'public'
      });
      
    } catch (error) {
      console.error("Error creating Firebase channel:", error);
      showError('Channel Creation Failed', error instanceof Error ? error.message : 'Unknown error occurred');
    }
  };

  // Handle sending messages in Firebase chat
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedChannel || !newMessage.trim()) return;
    
    if (!users || users.length === 0) {
      showError('No User Found', 'Please ensure you are logged in');
      return;
    }

    const currentUser = users[0];
    
    try {
      await sendMessage(
        selectedChannel.id,
        newMessage.trim(),
        currentUser._id,
        currentUser.name || 'Admin User',
        currentUser.email
      );
      
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
      showError('Message Send Failed', error instanceof Error ? error.message : 'Unknown error occurred');
    }
  };

  // Calculate analytics data
  const analyticsData = {
    totalUsers: Array.isArray(users) ? users.length : 0,
    totalHospitals: Array.isArray(hospitals) ? hospitals.length : 0,
    totalAlerts: Array.isArray(sosAlerts) ? sosAlerts.length : 0,
    totalTeamMembers: Array.isArray(teamMembers) ? teamMembers.length : 0,
    activeAlerts: Array.isArray(sosAlerts) ? sosAlerts.filter((alert: any) => alert.status === 'active').length : 0,
    verifiedHospitals: Array.isArray(hospitals) ? hospitals.filter((h: any) => h.verified).length : 0,
    departmentStats: Array.isArray(teamMembers) ? teamMembers.reduce((acc: any, member: any) => {
      acc[member.department] = (acc[member.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) : {},
  };

  // Enhanced Dashboard with modern UI and real-time data
  const renderEnhancedDashboard = () => (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '2rem' 
    }}>
      {/* Real-time Status Bar */}
      <div style={{ 
        background: 'linear-gradient(to right, var(--primary), var(--secondary))',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-lg)',
        padding: '1.5rem',
        color: 'var(--primary-foreground)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <div>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              marginBottom: '0.5rem'
            }}>
              Blood Donation Platform Dashboard
            </h2>
            <p style={{ 
              opacity: 0.8,
              color: 'var(--primary-foreground)'
            }}>
              Real-time monitoring and analytics
            </p>
          </div>
          <div style={{ 
            textAlign: 'right',
            marginTop: '0.5rem'
          }}>
            <div style={{ 
              fontSize: '0.875rem', 
              opacity: 0.8,
              color: 'var(--primary-foreground)'
            }}>
              Last Updated
            </div>
            <div style={{ 
              fontSize: '1.125rem', 
              fontWeight: '600'
            }}>
              {realTimeData?.lastUpdated ? new Date(realTimeData.lastUpdated).toLocaleTimeString() : "Loading..."}
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem'
      }}>
        {renderAnalyticsCard(
          "Active Users", 
          realTimeData?.totalUsers || 0, 
          "👥", 
          "border-left-blue", 
          `+${realTimeData?.recentUsers || 0} today`
        )}
        {renderAnalyticsCard(
          "Total Donors", 
          realTimeData?.totalDonors || 0, 
          "❤️", 
          "border-left-red", 
          `${realTimeData?.availableDonors || 0} available`
        )}
        {renderAnalyticsCard(
          "Verified Hospitals", 
          realTimeData?.verifiedHospitals || 0, 
          "🏥", 
          "border-left-green", 
          `${realTimeData?.totalHospitals || 0} total`
        )}
        {renderAnalyticsCard(
          "Active SOS Alerts", 
          realTimeData?.activeSosAlerts || 0, 
          "🚨", 
          "border-left-orange", 
          `${realTimeData?.responseRate || 0}% response rate`
        )}
      </div>

      {/* Live Activity Feed */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr', 
        gap: '1.5rem'
      }}>
        <div style={{ 
          backgroundColor: 'var(--card)',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-lg)',
          padding: '1.5rem',
          color: 'var(--foreground)'
        }}>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '600', 
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center'
          }}>
            <span style={{ marginRight: '0.5rem' }}>⚡</span>
            Live Activity Feed
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {realTimeData?.recentUsers > 0 && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                backgroundColor: 'rgba(59, 130, 246, 0.1)'
              }}>
                <div style={{ 
                  width: '0.5rem', 
                  height: '0.5rem', 
                  backgroundColor: '#3b82f6',
                  borderRadius: '50%',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}></div>
                <span style={{ 
                  fontSize: '0.875rem',
                  color: '#1e40af'
                }}>
                  {realTimeData.recentUsers} new users registered today
                </span>
              </div>
            )}
            {realTimeData?.recentAlerts > 0 && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                backgroundColor: 'rgba(239, 68, 68, 0.1)'
              }}>
                <div style={{ 
                  width: '0.5rem', 
                  height: '0.5rem', 
                  backgroundColor: '#ef4444',
                  borderRadius: '50%',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}></div>
                <span style={{ 
                  fontSize: '0.875rem',
                  color: '#991b1b'
                }}>
                  {realTimeData.recentAlerts} SOS alerts created today
                </span>
              </div>
            )}
            {realTimeData?.recentResponses > 0 && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                backgroundColor: 'rgba(34, 197, 94, 0.1)'
              }}>
                <div style={{ 
                  width: '0.5rem', 
                  height: '0.5rem', 
                  backgroundColor: '#22c55e',
                  borderRadius: '50%',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}></div>
                <span style={{ 
                  fontSize: '0.875rem',
                  color: '#166534'
                }}>
                  {realTimeData.recentResponses} donor responses today
                </span>
              </div>
            )}
          </div>
        </div>

        <div style={{ 
          backgroundColor: 'var(--card)',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-lg)',
          padding: '1.5rem',
          color: 'var(--foreground)'
        }}>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '600', 
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center'
          }}>
            <span style={{ marginRight: '0.5rem' }}>📊</span>
            System Health
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem'
          }}>
            <div style={{ 
              textAlign: 'center', 
              padding: '1rem',
              borderRadius: '0.5rem',
              backgroundColor: 'rgba(34, 197, 94, 0.1)'
            }}>
              <div style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold',
                color: '#22c55e'
              }}>
                {realTimeData?.systemHealth?.uptime || 99.9}%
              </div>
              <div style={{ 
                fontSize: '0.875rem',
                color: 'var(--muted-foreground)'
              }}>
                Uptime
              </div>
            </div>
            <div style={{ 
              textAlign: 'center', 
              padding: '1rem',
              borderRadius: '0.5rem',
              backgroundColor: 'rgba(59, 130, 246, 0.1)'
            }}>
              <div style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold',
                color: '#3b82f6'
              }}>
                {realTimeData?.systemHealth?.avgResponseTime || 2.3}s
              </div>
              <div style={{ 
                fontSize: '0.875rem',
                color: 'var(--muted-foreground)'
              }}>
                Avg Response
              </div>
            </div>
            <div style={{ 
              textAlign: 'center', 
              padding: '1rem',
              borderRadius: '0.5rem',
              backgroundColor: 'rgba(192, 132, 252, 0.1)'
            }}>
              <div style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold',
                color: '#a855f7'
              }}>
                {realTimeData?.systemHealth?.activeConnections || 75}
              </div>
              <div style={{ 
                fontSize: '0.875rem',
                color: 'var(--muted-foreground)'
              }}>
                Active Connections
              </div>
            </div>
            <div style={{ 
              textAlign: 'center', 
              padding: '1rem',
              borderRadius: '0.5rem',
              backgroundColor: 'rgba(251, 146, 60, 0.1)'
            }}>
              <div style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold',
                color: '#f97316'
              }}>
                {realTimeData?.systemHealth?.serverLoad || 25}%
              </div>
              <div style={{ 
                fontSize: '0.875rem',
                color: 'var(--muted-foreground)'
              }}>
                Server Load
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ 
        backgroundColor: 'var(--card)',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-lg)',
        padding: '1.5rem',
        color: 'var(--foreground)'
      }}>
        <h3 style={{ 
          fontSize: '1.125rem', 
          fontWeight: '600', 
          marginBottom: '1rem'
        }}>
          Quick Actions
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <button
            onClick={() => setShowCampaignForm(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              background: 'linear-gradient(to right, #10b981, #059669)',
              color: 'white',
              borderRadius: '0.5rem',
              transition: 'all 0.2s ease-in-out',
              cursor: 'pointer',
              border: 'none'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #059669, #047857)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #10b981, #059669)'}
          >
            <span style={{ marginRight: '0.5rem' }}>📢</span>
            Create Campaign
          </button>
          <button
            onClick={() => setShowPhotoForm(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              background: 'linear-gradient(to right, #3b82f6, #2563eb)',
              color: 'white',
              borderRadius: '0.5rem',
              transition: 'all 0.2s ease-in-out',
              cursor: 'pointer',
              border: 'none'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #2563eb, #1d4ed8)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #3b82f6, #2563eb)'}
          >
            <span style={{ marginRight: '0.5rem' }}>📸</span>
            Upload Photo
          </button>
          <button
            onClick={() => setActiveTab("donors")}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              background: 'linear-gradient(to right, var(--primary), var(--secondary))',
              color: 'var(--primary-foreground)',
              borderRadius: '0.5rem',
              transition: 'all 0.2s ease-in-out',
              cursor: 'pointer',
              border: 'none'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to right, var(--primary-hover), var(--secondary))'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to right, var(--primary), var(--secondary))'}
          >
            <span style={{ marginRight: '0.5rem' }}>❤️</span>
            Verify Donors
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              background: 'linear-gradient(to right, #a855f7, #9333ea)',
              color: 'white',
              borderRadius: '0.5rem',
              transition: 'all 0.2s ease-in-out',
              cursor: 'pointer',
              border: 'none'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #9333ea, #7e22ce)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #a855f7, #9333ea)'}
          >
            <span style={{ marginRight: '0.5rem' }}>⚡</span>
            Live Analytics
          </button>
        </div>
      </div>
    </div>
  );

  // Real-time Analytics Dashboard
  const renderRealTimeAnalytics = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Real-time Header */}
      <div style={{ 
        background: 'linear-gradient(to right, var(--primary), var(--secondary))',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-lg)',
        padding: '1.5rem',
        color: 'var(--primary-foreground)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <div>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              marginBottom: '0.5rem'
            }}>
              Real-time Analytics
            </h2>
            <p style={{ 
              opacity: 0.8,
              color: 'var(--primary-foreground)'
            }}>
              Live monitoring and insights
            </p>
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem'
          }}>
            <div style={{ 
              width: '0.75rem', 
              height: '0.75rem', 
              backgroundColor: '#4ade80',
              borderRadius: '50%',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}></div>
            <span style={{ fontSize: '0.875rem' }}>Live</span>
          </div>
        </div>
      </div>

      {/* Blood Type Distribution */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr', 
        gap: '1.5rem'
      }}>
        <div style={{ 
          backgroundColor: 'var(--card)',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-lg)',
          padding: '1.5rem',
          color: 'var(--foreground)'
        }}>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '600', 
            marginBottom: '1rem'
          }}>
            Blood Type Distribution
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {realTimeData?.bloodTypeDistribution && Object.entries(realTimeData.bloodTypeDistribution).map(([type, count]) => (
              <div key={type} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center'
              }}>
                <span style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  {type}
                </span>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem'
                }}>
                  <div style={{ 
                    width: '5rem', 
                    backgroundColor: '#e5e7eb',
                    borderRadius: '9999px',
                    height: '0.5rem'
                  }}>
                    <div 
                      style={{ 
                        backgroundColor: '#ef4444',
                        height: '0.5rem',
                        borderRadius: '9999px',
                        width: `${realTimeData.totalDonors > 0 ? ((count as number) / realTimeData.totalDonors) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                  <span style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: '600',
                    color: '#111827'
                  }}>
                    {count as number}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ 
          backgroundColor: 'white',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-lg)',
          padding: '1.5rem'
        }}>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '600', 
            marginBottom: '1rem',
            color: '#111827'
          }}>
            Alert Urgency Levels
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {realTimeData?.urgencyDistribution && Object.entries(realTimeData.urgencyDistribution).map(([urgency, count]) => (
              <div key={urgency} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center'
              }}>
                <span style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: '500',
                  textTransform: 'capitalize',
                  color: '#374151'
                }}>
                  {urgency}
                </span>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem'
                }}>
                  <div style={{ 
                    width: '5rem', 
                    backgroundColor: '#e5e7eb',
                    borderRadius: '9999px',
                    height: '0.5rem'
                  }}>
                    <div 
                      style={{ 
                        height: '0.5rem',
                        borderRadius: '9999px',
                        backgroundColor: urgency === 'critical' ? '#dc2626' :
                                       urgency === 'urgent' ? '#f97316' :
                                       urgency === 'normal' ? '#22c55e' : '#9ca3af',
                        width: `${realTimeData.totalSosAlerts > 0 ? ((count as number) / realTimeData.totalSosAlerts) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                  <span style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: '600',
                    color: '#111827'
                  }}>
                    {count as number}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Growth Trends */}
      <div style={{ 
        backgroundColor: 'white',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-lg)',
        padding: '1.5rem'
      }}>
        <h3 style={{ 
          fontSize: '1.125rem', 
          fontWeight: '600', 
          marginBottom: '1.5rem',
          color: '#111827'
        }}>
          Growth Trends
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr', 
          gap: '1.5rem'
        }}>
          <div>
            <h4 style={{ 
              fontSize: '1rem', 
              fontWeight: '500', 
              marginBottom: '1rem',
              color: '#374151'
            }}>
              User Registration Trend
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {realTimeData?.userGrowthTrend?.map((trend: any) => (
                <div key={trend.period} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center'
                }}>
                  <span style={{ 
                    fontSize: '0.875rem',
                    color: '#4b5563'
                  }}>
                    Last {trend.period}
                  </span>
                  <span style={{ 
                    fontSize: '1.125rem', 
                    fontWeight: '600',
                    color: '#2563eb'
                  }}>
                    +{trend.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ 
              fontSize: '1rem', 
              fontWeight: '500', 
              marginBottom: '1rem',
              color: '#374151'
            }}>
              SOS Alert Trend
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {realTimeData?.alertTrend?.map((trend: any) => (
                <div key={trend.period} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center'
                }}>
                  <span style={{ 
                    fontSize: '0.875rem',
                    color: '#4b5563'
                  }}>
                    Last {trend.period}
                  </span>
                  <span style={{ 
                    fontSize: '1.125rem', 
                    fontWeight: '600',
                    color: '#dc2626'
                  }}>
                    +{trend.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem'
      }}>
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-lg)',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <div style={{ 
            fontSize: '1.875rem', 
            fontWeight: '700',
            color: '#22c55e'
          }}>
            {realTimeData?.responseRate || 0}%
          </div>
          <div style={{ 
            fontSize: '0.875rem',
            marginTop: '0.25rem',
            color: '#4b5563'
          }}>
            Response Rate
          </div>
          <div style={{ 
            fontSize: '0.75rem',
            marginTop: '0.25rem',
            color: realTimeData?.responseRate > 80 ? '#22c55e' : 
                   realTimeData?.responseRate > 60 ? '#3b82f6' : '#ef4444'
          }}>
            {realTimeData?.responseRate > 80 ? "↗ Excellent" : 
             realTimeData?.responseRate > 60 ? "→ Good" : "↘ Needs Improvement"}
          </div>
        </div>
        
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-lg)',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <div style={{ 
            fontSize: '1.875rem', 
            fontWeight: '700',
            color: '#3b82f6'
          }}>
            {realTimeData?.availableDonors || 0}
          </div>
          <div style={{ 
            fontSize: '0.875rem',
            marginTop: '0.25rem',
            color: '#4b5563'
          }}>
            Available Donors
          </div>
          <div style={{ 
            fontSize: '0.75rem',
            marginTop: '0.25rem',
            color: '#3b82f6'
          }}>
            Ready to donate
          </div>
        </div>

        <div style={{ 
          backgroundColor: 'white',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-lg)',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <div style={{ 
            fontSize: '1.875rem', 
            fontWeight: '700',
            color: '#a855f7'
          }}>
            {realTimeData?.verifiedHospitals || 0}
          </div>
          <div style={{ 
            fontSize: '0.875rem',
            marginTop: '0.25rem',
            color: '#4b5563'
          }}>
            Verified Hospitals
          </div>
          <div style={{ 
            fontSize: '0.75rem',
            marginTop: '0.25rem',
            color: '#a855f7'
          }}>
            Trusted partners
          </div>
        </div>

        <div style={{ 
          backgroundColor: 'white',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-lg)',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <div style={{ 
            fontSize: '1.875rem', 
            fontWeight: '700',
            color: '#f97316'
          }}>
            {realTimeData?.activeSosAlerts || 0}
          </div>
          <div style={{ 
            fontSize: '0.875rem',
            marginTop: '0.25rem',
            color: '#4b5563'
          }}>
            Active Alerts
          </div>
          <div style={{ 
            fontSize: '0.75rem',
            marginTop: '0.25rem',
            color: '#f97316'
          }}>
            Urgent needs
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalyticsCard = (title: string, value: number, icon: string, colorClass: string, subtitle?: string) => {
    // Map color classes to actual styles
    const getColorStyle = () => {
      switch (colorClass) {
        case "border-left-blue":
          return { borderLeft: "4px solid #3b82f6" };
        case "border-left-red":
          return { borderLeft: "4px solid #ef4444" };
        case "border-left-green":
          return { borderLeft: "4px solid #22c55e" };
        case "border-left-orange":
          return { borderLeft: "4px solid #f97316" };
        case "border-left-purple":
          return { borderLeft: "4px solid #a855f7" };
        case "border-left-yellow":
          return { borderLeft: "4px solid #eab308" };
        default:
          return { borderLeft: "4px solid var(--primary)" };
      }
    };

    return (
      <div 
        style={{
          backgroundColor: 'var(--card)',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-md)',
          padding: '1.5rem',
          transition: 'all 0.2s ease-in-out',
          ...getColorStyle()
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between'
        }}>
          <div>
            <p style={{ 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              marginBottom: '0.25rem',
              color: 'var(--muted-foreground)'
            }}>
              {title}
            </p>
            <p style={{ 
              fontSize: '1.875rem', 
              fontWeight: '700',
              color: 'var(--foreground)'
            }}>
              {value}
            </p>
            {subtitle && (
              <p style={{ 
                fontSize: '0.75rem', 
                marginTop: '0.25rem',
                color: 'var(--muted-foreground)'
              }}>
                {subtitle}
              </p>
            )}
          </div>
          <div style={{ fontSize: '2.25rem' }}>
            {icon}
          </div>
        </div>
      </div>
    );
  };

  const handleDeleteUser = async (userId: Id<"users">) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await (deleteUser as any)({ userId });
        alert("User deleted successfully!");
      } catch (error) {
        alert("Failed to delete user");
      }
    }
  };

  const handleDeleteHospital = async (hospitalId: Id<"hospitals">) => {
    if (confirm("Are you sure you want to delete this hospital?")) {
      try {
        await (deleteHospital as any)({ hospitalId });
        alert("Hospital deleted successfully!");
      } catch (error) {
        alert("Failed to delete hospital");
      }
    }
  };

  const handleVerifyUser = async (userId: Id<"users">) => {
    try {
      await (verifyUser as any)({ userId });
      alert("User verified successfully!");
    } catch (error) {
      alert("Failed to verify user");
    }
  };

  const handleVerifyHospital = async (hospitalId: Id<"hospitals">) => {
    try {
      await (verifyHospital as any)({ hospitalId });
      alert("Hospital verified successfully!");
    } catch (error) {
      alert("Failed to verify hospital");
    }
  };

  const renderOverview = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Analytics Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem'
      }}>
        {renderAnalyticsCard("Total Users", analyticsData.totalUsers, "👥", "border-left-blue", "Registered users")}
        {renderAnalyticsCard("Hospitals", analyticsData.totalHospitals, "🏥", "border-left-green", `${analyticsData.verifiedHospitals} verified`)}
        {renderAnalyticsCard("SOS Alerts", analyticsData.totalAlerts, "🚨", "border-left-red", `${analyticsData.activeAlerts} active`)}
        {renderAnalyticsCard("Team Members", analyticsData.totalTeamMembers, "👨‍💼", "border-left-purple", "Active staff")}
      </div>

      {/* Charts and Analytics */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr', 
        gap: '1.5rem'
      }}>
        {/* Department Distribution */}
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-md)',
          padding: '1.5rem'
        }}>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '600', 
            marginBottom: '1rem',
            color: '#111827'
          }}>
            Team by Department
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {Object.entries(analyticsData.departmentStats).map(([dept, count]) => (
              <div key={dept} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center'
              }}>
                <span style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: '500',
                  textTransform: 'capitalize',
                  color: '#374151'
                }}>
                  {dept}
                </span>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem'
                }}>
                  <div style={{ 
                    width: '5rem', 
                    backgroundColor: '#e5e7eb',
                    borderRadius: '9999px',
                    height: '0.5rem'
                  }}>
                    <div 
                      style={{ 
                        backgroundColor: '#3b82f6',
                        height: '0.5rem',
                        borderRadius: '9999px',
                        width: `${analyticsData.totalTeamMembers > 0 ? ((count as number) / analyticsData.totalTeamMembers) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                  <span style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: '600',
                    color: '#111827'
                  }}>
                    {count as number}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-md)',
          padding: '1.5rem'
        }}>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '600', 
            marginBottom: '1rem',
            color: '#111827'
          }}>
            Recent Activity
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem'
            }}>
              <div style={{ 
                width: '2rem', 
                height: '2rem', 
                backgroundColor: 'rgba(34, 197, 94, 0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ 
                  color: '#22c55e', 
                  fontSize: '0.875rem'
                }}>
                  ✓
                </span>
              </div>
              <div>
                <p style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: '500',
                  color: '#111827'
                }}>
                  System running smoothly
                </p>
                <p style={{ 
                  fontSize: '0.75rem',
                  color: '#6b7280'
                }}>
                  All services operational
                </p>
              </div>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem'
            }}>
              <div style={{ 
                width: '2rem', 
                height: '2rem', 
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ 
                  color: '#3b82f6', 
                  fontSize: '0.875rem'
                }}>
                  🏥
                </span>
              </div>
              <div>
                <p style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: '500',
                  color: '#111827'
                }}>
                  {analyticsData.totalHospitals} hospitals registered
                </p>
                <p style={{ 
                  fontSize: '0.75rem',
                  color: '#6b7280'
                }}>
                  {analyticsData.verifiedHospitals} verified
                </p>
              </div>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem'
            }}>
              <div style={{ 
                width: '2rem', 
                height: '2rem', 
                backgroundColor: 'rgba(192, 132, 252, 0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ 
                  color: '#a855f7', 
                  fontSize: '0.875rem'
                }}>
                  👥
                </span>
              </div>
              <div>
                <p style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: '500',
                  color: '#111827'
                }}>
                  {analyticsData.totalTeamMembers} team members active
                </p>
                <p style={{ 
                  fontSize: '0.75rem',
                  color: '#6b7280'
                }}>
                  Across {Object.keys(analyticsData.departmentStats).length} departments
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ 
        backgroundColor: 'white',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-md)',
        padding: '1.5rem'
      }}>
        <h3 style={{ 
          fontSize: '1.125rem', 
          fontWeight: '600', 
          marginBottom: '1rem',
          color: '#111827'
        }}>
          Quick Actions
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem'
        }}>
          <button
            onClick={() => setShowTeamForm(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              background: 'linear-gradient(to right, #3b82f6, #2563eb)',
              color: 'white',
              borderRadius: '0.5rem',
              transition: 'all 0.2s ease-in-out',
              cursor: 'pointer',
              border: 'none'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #2563eb, #1d4ed8)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #3b82f6, #2563eb)'}
          >
            <span style={{ marginRight: '0.5rem' }}>👥</span>
            Add Team Member
          </button>
          <button
            onClick={() => setShowChannelForm(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              background: 'linear-gradient(to right, #10b981, #059669)',
              color: 'white',
              borderRadius: '0.5rem',
              transition: 'all 0.2s ease-in-out',
              cursor: 'pointer',
              border: 'none'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #059669, #047857)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #10b981, #059669)'}
          >
            <span style={{ marginRight: '0.5rem' }}>💬</span>
            Create Channel
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              background: 'linear-gradient(to right, #a855f7, #9333ea)',
              color: 'white',
              borderRadius: '0.5rem',
              transition: 'all 0.2s ease-in-out',
              cursor: 'pointer',
              border: 'none'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #9333ea, #7e22ce)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #a855f7, #9333ea)'}
          >
            <span style={{ marginRight: '0.5rem' }}>📊</span>
            View Analytics
          </button>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Main Analytics Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem'
      }}>
        {renderAnalyticsCard("Growth Rate", 15, "📈", "border-left-green", "+15% this month")}
        {renderAnalyticsCard("Response Time", 3, "⏱️", "border-left-yellow", "Average minutes")}
        {renderAnalyticsCard("Success Rate", 98, "✅", "border-left-green", "98% success rate")}
      </div>

      {/* Detailed Charts */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr', 
        gap: '1.5rem'
      }}>
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-md)',
          padding: '1.5rem'
        }}>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '600', 
            marginBottom: '1rem',
            color: '#111827'
          }}>
            Platform Performance
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center'
            }}>
              <span style={{ 
                fontSize: '0.875rem', 
                fontWeight: '500',
                color: '#374151'
              }}>
                User Registration
              </span>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem'
              }}>
                <div style={{ 
                  width: '6rem', 
                  backgroundColor: '#e5e7eb',
                  borderRadius: '9999px',
                  height: '0.5rem'
                }}>
                  <div 
                    style={{ 
                      backgroundColor: '#3b82f6',
                      height: '0.5rem',
                      borderRadius: '9999px',
                      width: "75%"
                    }}
                  ></div>
                </div>
                <span style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: '600',
                  color: '#111827'
                }}>
                  75%
                </span>
              </div>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center'
            }}>
              <span style={{ 
                fontSize: '0.875rem', 
                fontWeight: '500',
                color: '#374151'
              }}>
                Hospital Verification
              </span>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem'
              }}>
                <div style={{ 
                  width: '6rem', 
                  backgroundColor: '#e5e7eb',
                  borderRadius: '9999px',
                  height: '0.5rem'
                }}>
                  <div 
                    style={{ 
                      backgroundColor: '#22c55e',
                      height: '0.5rem',
                      borderRadius: '9999px',
                      width: "90%"
                    }}
                  ></div>
                </div>
                <span style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: '600',
                  color: '#111827'
                }}>
                  90%
                </span>
              </div>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center'
            }}>
              <span style={{ 
                fontSize: '0.875rem', 
                fontWeight: '500',
                color: '#374151'
              }}>
                Alert Response
              </span>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem'
              }}>
                <div style={{ 
                  width: '6rem', 
                  backgroundColor: '#e5e7eb',
                  borderRadius: '9999px',
                  height: '0.5rem'
                }}>
                  <div 
                    style={{ 
                      backgroundColor: '#ef4444',
                      height: '0.5rem',
                      borderRadius: '9999px',
                      width: "95%"
                    }}
                  ></div>
                </div>
                <span style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: '600',
                  color: '#111827'
                }}>
                  95%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ 
          backgroundColor: 'white',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-md)',
          padding: '1.5rem'
        }}>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '600', 
            marginBottom: '1rem',
            color: '#111827'
          }}>
            System Health
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem'
          }}>
            <div style={{ 
              textAlign: 'center', 
              padding: '1rem',
              borderRadius: '0.5rem',
              backgroundColor: 'rgba(34, 197, 94, 0.1)'
            }}>
              <div style={{ 
                fontSize: '1.5rem', 
                fontWeight: '700',
                color: '#22c55e'
              }}>
                99.9%
              </div>
              <div style={{ 
                fontSize: '0.875rem',
                color: '#4b5563'
              }}>
                Uptime
              </div>
            </div>
            <div style={{ 
              textAlign: 'center', 
              padding: '1rem',
              borderRadius: '0.5rem',
              backgroundColor: 'rgba(59, 130, 246, 0.1)'
            }}>
              <div style={{ 
                fontSize: '1.5rem', 
                fontWeight: '700',
                color: '#3b82f6'
              }}>
                2.3s
              </div>
              <div style={{ 
                fontSize: '0.875rem',
                color: '#4b5563'
              }}>
                Avg Response
              </div>
            </div>
            <div style={{ 
              textAlign: 'center', 
              padding: '1rem',
              borderRadius: '0.5rem',
              backgroundColor: 'rgba(192, 132, 252, 0.1)'
            }}>
              <div style={{ 
                fontSize: '1.5rem', 
                fontWeight: '700',
                color: '#a855f7'
              }}>
                {analyticsData.totalUsers}
              </div>
              <div style={{ 
                fontSize: '0.875rem',
                color: '#4b5563'
              }}>
                Active Users
              </div>
            </div>
            <div style={{ 
              textAlign: 'center', 
              padding: '1rem',
              borderRadius: '0.5rem',
              backgroundColor: 'rgba(251, 146, 60, 0.1)'
            }}>
              <div style={{ 
                fontSize: '1.5rem', 
                fontWeight: '700',
                color: '#f97316'
              }}>
                24/7
              </div>
              <div style={{ 
                fontSize: '0.875rem',
                color: '#4b5563'
              }}>
                Monitoring
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div style={{ 
        backgroundColor: 'white',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-md)',
        padding: '1.5rem'
      }}>
        <h3 style={{ 
          fontSize: '1.125rem', 
          fontWeight: '600', 
          marginBottom: '1.5rem',
          color: '#111827'
        }}>
          Performance Metrics
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem'
        }}>
          <div style={{ 
            textAlign: 'center', 
            padding: '1rem',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem'
          }}>
            <div style={{ 
              fontSize: '1.875rem', 
              fontWeight: '700',
              color: '#3b82f6'
            }}>
              {analyticsData.totalUsers}
            </div>
            <div style={{ 
              fontSize: '0.875rem',
              color: '#4b5563'
            }}>
              Total Users
            </div>
            <div style={{ 
              fontSize: '0.75rem',
              marginTop: '0.25rem',
              color: '#22c55e'
            }}>
              ↗ +12% from last month
            </div>
          </div>
          <div style={{ 
            textAlign: 'center', 
            padding: '1rem',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem'
          }}>
            <div style={{ 
              fontSize: '1.875rem', 
              fontWeight: '700',
              color: '#22c55e'
            }}>
              {analyticsData.verifiedHospitals}
            </div>
            <div style={{ 
              fontSize: '0.875rem',
              color: '#4b5563'
            }}>
              Verified Hospitals
            </div>
            <div style={{ 
              fontSize: '0.75rem',
              marginTop: '0.25rem',
              color: '#22c55e'
            }}>
              ↗ +8% from last month
            </div>
          </div>
          <div style={{ 
            textAlign: 'center', 
            padding: '1rem',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem'
          }}>
            <div style={{ 
              fontSize: '1.875rem', 
              fontWeight: '700',
              color: '#ef4444'
            }}>
              {analyticsData.activeAlerts}
            </div>
            <div style={{ 
              fontSize: '0.875rem',
              color: '#4b5563'
            }}>
              Active Alerts
            </div>
            <div style={{ 
              fontSize: '0.75rem',
              marginTop: '0.25rem',
              color: '#4b5563'
            }}>
              Real-time monitoring
            </div>
          </div>
          <div style={{ 
            textAlign: 'center', 
            padding: '1rem',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem'
          }}>
            <div style={{ 
              fontSize: '1.875rem', 
              fontWeight: '700',
              color: '#a855f7'
            }}>
              {analyticsData.totalTeamMembers}
            </div>
            <div style={{ 
              fontSize: '0.875rem',
              color: '#4b5563'
            }}>
              Team Members
            </div>
            <div style={{ 
              fontSize: '0.75rem',
              marginTop: '0.25rem',
              color: '#22c55e'
            }}>
              ↗ +5% from last month
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTeamManagement = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <h3 style={{ 
          fontSize: '1.125rem', 
          fontWeight: '500',
          color: '#111827'
        }}>
          Team Management
        </h3>
        <button
          onClick={() => setShowTeamForm(true)}
          style={{
            backgroundColor: 'var(--primary)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            transition: 'background-color 0.2s ease-in-out',
            border: 'none',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
        >
          Add Team Member
        </button>
      </div>

      {/* Team Members List */}
      <div style={{ 
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        border: '1px solid rgba(220, 38, 38, 0.2)'
      }}>
        <div style={{ padding: '1.5rem' }}>
          <h4 style={{ 
            fontSize: '1rem', 
            fontWeight: '500', 
            marginBottom: '1rem',
            color: '#111827'
          }}>
            Current Team Members
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Array.isArray(teamMembers) && teamMembers.map((member: any) => (
              <div key={member._id} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '1rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem'
              }}>
                <div>
                  <h5 style={{ 
                    fontWeight: '500',
                    color: '#111827'
                  }}>
                    {member.name}
                  </h5>
                  <p style={{ 
                    fontSize: '0.875rem',
                    color: '#4b5563'
                  }}>
                    {member.email}
                  </p>
                  <p style={{ 
                    fontSize: '0.875rem',
                    color: '#6b7280'
                  }}>
                    {member.role} - {member.department}
                  </p>
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem'
                }}>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.75rem',
                    borderRadius: '9999px',
                    backgroundColor: member.status === 'active' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(156, 163, 175, 0.1)',
                    color: member.status === 'active' ? '#166534' : '#1f2937'
                  }}>
                    {member.status}
                  </span>
                  <span style={{ 
                    fontSize: '0.875rem',
                    color: '#6b7280'
                  }}>
                    {member.phone}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Form Modal */}
      {showTeamForm && (
        <div style={{ 
          position: 'fixed', 
          inset: '0', 
          backgroundColor: 'rgba(0, 0, 0, 0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: '50',
          padding: '1rem'
        }}>
          <div style={{ 
            backgroundColor: 'white',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow-xl)',
            width: '100%',
            maxWidth: '28rem',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '1.5rem'
              }}>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600',
                  color: '#111827'
                }}>
                  Add Team Member
                </h3>
                <button
                  onClick={() => setShowTeamForm(false)}
                  style={{
                    color: '#9ca3af',
                    transition: 'color 0.2s ease-in-out',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#4b5563'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
                >
                  <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleCreateTeamMember} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.875rem', 
                    fontWeight: '500', 
                    marginBottom: '0.25rem',
                    color: '#374151'
                  }}>
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={teamForm.name}
                    onChange={(e) => setTeamForm({...teamForm, name: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      focus: {
                        ring: '2px solid var(--primary)',
                        borderColor: 'var(--primary)'
                      }
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.875rem', 
                    fontWeight: '500', 
                    marginBottom: '0.25rem',
                    color: '#374151'
                  }}>
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={teamForm.email}
                    onChange={(e) => setTeamForm({...teamForm, email: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      focus: {
                        ring: '2px solid var(--primary)',
                        borderColor: 'var(--primary)'
                      }
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.875rem', 
                    fontWeight: '500', 
                    marginBottom: '0.25rem',
                    color: '#374151'
                  }}>
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={teamForm.password}
                    onChange={(e) => setTeamForm({...teamForm, password: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      focus: {
                        ring: '2px solid var(--primary)',
                        borderColor: 'var(--primary)'
                      }
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.875rem', 
                    fontWeight: '500', 
                    marginBottom: '0.25rem',
                    color: '#374151'
                  }}>
                    Role
                  </label>
                  <select
                    value={teamForm.role}
                    onChange={(e) => setTeamForm({...teamForm, role: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      focus: {
                        ring: '2px solid var(--primary)',
                        borderColor: 'var(--primary)'
                      }
                    }}
                  >
                    <option value="coordinator">Coordinator</option>
                    <option value="manager">Manager</option>
                    <option value="volunteer">Volunteer</option>
                    <option value="medical_staff">Medical Staff</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.875rem', 
                    fontWeight: '500', 
                    marginBottom: '0.25rem',
                    color: '#374151'
                  }}>
                    Department
                  </label>
                  <input
                    type="text"
                    required
                    value={teamForm.department}
                    onChange={(e) => setTeamForm({...teamForm, department: e.target.value})}
                    placeholder="e.g., Emergency Response, Blood Bank"
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      focus: {
                        ring: '2px solid var(--primary)',
                        borderColor: 'var(--primary)'
                      }
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.875rem', 
                    fontWeight: '500', 
                    marginBottom: '0.25rem',
                    color: '#374151'
                  }}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={teamForm.phone}
                    onChange={(e) => setTeamForm({...teamForm, phone: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      focus: {
                        ring: '2px solid var(--primary)',
                        borderColor: 'var(--primary)'
                      }
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.875rem', 
                    fontWeight: '500', 
                    marginBottom: '0.25rem',
                    color: '#374151'
                  }}>
                    Bio
                  </label>
                  <textarea
                    value={teamForm.bio}
                    onChange={(e) => setTeamForm({...teamForm, bio: e.target.value})}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      focus: {
                        ring: '2px solid var(--primary)',
                        borderColor: 'var(--primary)'
                      }
                    }}
                  />
                </div>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  gap: '0.75rem', 
                  paddingTop: '1rem'
                }}>
                  <button
                    type="button"
                    onClick={() => setShowTeamForm(false)}
                    style={{
                      padding: '0.5rem 1rem',
                      color: '#374151',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      transition: 'background-color 0.2s ease-in-out',
                      background: 'none',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      backgroundColor: 'var(--primary)',
                      color: 'white',
                      padding: '0.5rem 1.5rem',
                      borderRadius: '0.5rem',
                      transition: 'background-color 0.2s ease-in-out',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
                  >
                    Create Member
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderChat = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">Firebase Real-time Chat</h3>
        <button
          onClick={() => setShowChannelForm(true)}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
        >
          <span>�</span>
          <span>Create Channel</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md h-[600px] flex">
        {/* Channel List */}
        <div className="w-1/3 border-r border-gray-200 p-4">
          <h4 className="font-medium text-gray-900 mb-4">Firebase Channels</h4>
          <div className="space-y-2">
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => setSelectedChannel(channel)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedChannel?.id === channel.id
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🔥</span>
                  <span className="font-medium">{channel.name}</span>
                </div>
                {channel.description && (
                  <p className="text-xs text-gray-500 mt-1">{channel.description}</p>
                )}
                <div className="text-xs text-gray-400 mt-1">
                  {channel.memberCount} member{channel.memberCount !== 1 ? 's' : ''} • {channel.type}
                </div>
                {channel.lastMessage && (
                  <div className="text-xs text-gray-500 mt-1 truncate">
                    {channel.lastMessage.senderName}: {channel.lastMessage.text}
                  </div>
                )}
              </button>
            ))}
            
            {channels.length === 0 && (
              <div className="text-center text-gray-500 py-4">
                <p className="text-sm">No channels yet</p>
                <p className="text-xs">Create one to get started!</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedChannel ? (
            <>
              <div className="p-4 border-b border-gray-200">
                <h4 className="font-medium text-gray-900">
                  🔥 {selectedChannel.name}
                </h4>
                {selectedChannel.description && (
                  <p className="text-sm text-gray-600">{selectedChannel.description}</p>
                )}
              </div>

              <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                  {messages.length > 0 ? (
                    messages.map((message) => (
                      <div key={message.id} className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {message.senderName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">{message.senderName}</span>
                            <span className="text-xs text-gray-500">
                              {message.timestamp.toDate().toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-gray-700 mt-1">{message.text}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <div className="text-4xl mb-2">💬</div>
                      <p>Start a conversation!</p>
                      <p className="text-sm">Messages will appear here</p>
                    </div>
                  )}
                </div>
              </div>

              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Send
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <h4 className="text-lg font-medium mb-2">Select a channel</h4>
                <p>Choose a channel to start chatting with your team</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Donors Management with ID Verification
  const renderDonors = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Donor Management & Verification</h2>
        <div className="bg-red-50 px-4 py-2 rounded-lg">
          <span className="text-red-700 font-semibold">Total Donors: {Array.isArray(donors) ? donors.length : 0}</span>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-red-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-red-800">Donor Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-red-800">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-red-800">Blood Group</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-red-800">Location</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-red-800">ID Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-red-800">Verification</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-red-800">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Array.isArray(donors) && donors.map((donor: any) => (
                <tr key={donor._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                    <div>
                      <div>{donor.name}</div>
                      <div className="text-xs text-gray-500">{donor.userName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{donor.userEmail}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {donor.bloodGroup}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{donor.location}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {donor.idType ? (
                      <div>
                        <div className="font-medium">{donor.idType.toUpperCase()}</div>
                        <div className="text-xs text-gray-500">{donor.idNumber}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">Not provided</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        donor.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {donor.verified ? 'Verified' : 'Pending'}
                      </span>
                      {donor.idImageUrl && (
                        <button
                          onClick={() => window.open(donor.idImageUrl, '_blank')}
                          className="text-blue-600 hover:text-blue-800 text-xs"
                        >
                          View ID
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      {!donor.verified && donor.idImageUrl && (
                        <>
                          <button
                            onClick={() => handleVerifyDonor(donor._id)}
                            className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700 transition-colors"
                          >
                            Verify
                          </button>
                          <button
                            onClick={() => handleRejectDonor(donor._id)}
                            className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700 transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {!donor.idImageUrl && (
                        <span className="text-gray-400 text-sm">No ID uploaded</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Campaign Management
  const renderCampaigns = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Campaign Management</h2>
        <div className="flex space-x-4">
          <div className="bg-green-50 px-4 py-2 rounded-lg">
            <span className="text-green-700 font-semibold">
              Active: {Array.isArray(campaigns) ? campaigns.filter(c => c.isActive).length : 0}
            </span>
          </div>
          <button
            onClick={() => setShowCampaignForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Create Campaign
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(campaigns) && campaigns.map((campaign: any) => (
          <div key={campaign._id} className="bg-white rounded-xl shadow-lg overflow-hidden">
            {campaign.imageUrl && (
              <img 
                src={campaign.imageUrl} 
                alt={campaign.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{campaign.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  campaign.priority === 'critical' ? 'bg-red-100 text-red-800' :
                  campaign.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  campaign.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {campaign.priority}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{campaign.shortDescription || campaign.description}</p>
              
              <div className="space-y-2 text-sm text-gray-500 mb-4">
                {campaign.targetBloodType && (
                  <div>Blood Type: <span className="font-medium text-red-600">{campaign.targetBloodType}</span></div>
                )}
                {campaign.targetLocation && (
                  <div>Location: <span className="font-medium">{campaign.targetLocation}</span></div>
                )}
                {campaign.targetGoal && (
                  <div>
                    Progress: <span className="font-medium">{campaign.currentCount || 0}/{campaign.targetGoal}</span>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${campaign.targetGoal > 0 ? ((campaign.currentCount || 0) / campaign.targetGoal) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                <div>
                  Duration: {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  campaign.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {campaign.isActive ? 'Active' : 'Inactive'}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedCampaign(campaign)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleDeleteCampaign(campaign._id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Campaign Analytics */}
      {campaignAnalytics && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Analytics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{campaignAnalytics.totalCampaigns}</div>
              <div className="text-sm text-gray-600">Total Campaigns</div>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{campaignAnalytics.activeCampaigns}</div>
              <div className="text-sm text-gray-600">Active Campaigns</div>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">{campaignAnalytics.totalRegistrations}</div>
              <div className="text-sm text-gray-600">Total Registrations</div>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-3xl font-bold text-orange-600">{campaignAnalytics.successRate}%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Gallery Management
  const renderGallery = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Photo Gallery</h2>
        <div className="flex space-x-4">
          <div className="bg-blue-50 px-4 py-2 rounded-lg">
            <span className="text-blue-700 font-semibold">
              Total Photos: {Array.isArray(galleryPhotos) ? galleryPhotos.length : 0}
            </span>
          </div>
          <button
            onClick={() => setShowPhotoForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Manual Upload
          </button>
        </div>
      </div>

      {/* Quick Upload Section */}
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📸 Quick Upload from Device</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <FirebaseImageUpload
              category="general"
              currentUser={{
                id: users?.[0]?._id || 'anonymous',
                name: users?.[0]?.name || 'Admin User',
                email: users?.[0]?.email
              }}
              onUploadComplete={(imageId, imageUrl) => {
                showSuccess('Upload Complete!', 'Image uploaded to Firebase and will appear in the public gallery!');
              }}
              onUploadError={(error) => {
                showError('Upload Failed', `Upload failed: ${error}`);
              }}
              showPreview={true}
              maxFileSize={10}
            />
          </div>
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">🔥 Firebase Features</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Real-time upload progress</li>
                <li>• Firebase cloud storage</li>
                <li>• Image metadata tracking</li>
                <li>• Automatic thumbnails</li>
                <li>• Public gallery integration</li>
                <li>• Max 10MB file size</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">📁 Categories</h4>
              <div className="flex flex-wrap gap-1">
                {['Events', 'Campaigns', 'Donors', 'Awareness'].map(cat => (
                  <span key={cat} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter by Categories</h3>
        <div className="flex flex-wrap gap-2">
          {['all', 'donation_drive', 'awareness', 'event', 'testimonial', 'general'].map(category => (
            <button
              key={category}
              className="px-4 py-2 bg-gray-100 hover:bg-purple-100 rounded-lg text-sm font-medium capitalize transition-colors"
            >
              {category === 'all' ? 'All Photos' : category.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.isArray(galleryPhotos) && galleryPhotos.map((photo: any) => (
          <div key={photo._id} className="bg-white rounded-xl shadow-lg overflow-hidden group">
            <div className="relative">
              <img 
                src={photo.imageUrl} 
                alt={photo.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 right-2">
                <button
                  onClick={() => handleDeletePhoto(photo._id)}
                  className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-4">
              <h4 className="font-semibold text-gray-900 mb-2">{photo.title}</h4>
              {photo.description && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{photo.description}</p>
              )}
              <div className="flex justify-between items-center">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium capitalize">
                  {photo.category.replace('_', ' ')}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(photo.uploadedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Photo Carousel for Featured Photos */}
      {Array.isArray(galleryPhotos) && galleryPhotos.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Featured Photos Carousel</h3>
          <div className="relative">
            <div className="flex space-x-4 overflow-x-auto pb-4">
              {galleryPhotos.slice(0, 6).map((photo: any) => (
                <div key={photo._id} className="flex-shrink-0 w-64">
                  <img 
                    src={photo.imageUrl} 
                    alt={photo.title}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <div className="mt-2">
                    <h5 className="font-medium text-gray-900 text-sm">{photo.title}</h5>
                    <p className="text-gray-500 text-xs">{photo.category.replace('_', ' ')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <div className="bg-blue-50 px-4 py-2 rounded-lg">
          <span className="text-blue-700 font-semibold">Total Users: {Array.isArray(users) ? users.length : 0}</span>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-red-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-red-800">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-red-800">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-red-800">Phone</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-red-800">Blood Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-red-800">Location</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-red-800">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-red-800">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Array.isArray(users) && users.map((user: any) => (
                <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.phone || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {user.bloodType || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.location || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.verified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      {!user.verified && (
                        <button
                          onClick={() => handleVerifyUser(user._id)}
                          className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700 transition-colors"
                        >
                          Verify
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderHospitals = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Hospital Management</h2>
        <div className="bg-blue-50 px-4 py-2 rounded-lg">
          <span className="text-blue-700 font-semibold">Total Hospitals: {Array.isArray(hospitals) ? hospitals.length : 0}</span>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-red-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-red-800">Hospital Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-red-800">Contact Person</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-red-800">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-red-800">Phone</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-red-800">Location</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-red-800">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-red-800">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Array.isArray(hospitals) && hospitals.map((hospital: any) => (
                <tr key={hospital._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{hospital.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{hospital.contactPerson || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{hospital.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{hospital.phone || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{hospital.address || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      hospital.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {hospital.verified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      {!hospital.verified && (
                        <button
                          onClick={() => handleVerifyHospital(hospital._id)}
                          className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700 transition-colors"
                        >
                          Verify
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteHospital(hospital._id)}
                        className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "analytics", label: "Real-time Analytics", icon: "⚡" },
    { id: "users", label: "Users", icon: "👥" },
    { id: "donors", label: "Donors", icon: "❤️" },
    { id: "hospitals", label: "Hospitals", icon: "🏥" },
    { id: "campaigns", label: "Campaigns", icon: "📢" },
    { id: "gallery", label: "Gallery", icon: "📸" },
    { id: "team", label: "Team", icon: "👨‍💼" },
    { id: "chat", label: "Communication", icon: "💬" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-lg text-gray-600">Manage your blood donation platform</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 bg-white rounded-xl shadow-md">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-6 font-medium text-sm whitespace-nowrap border-b-2 transition-all duration-200 ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "dashboard" && renderEnhancedDashboard()}
          {activeTab === "analytics" && renderRealTimeAnalytics()}
          {activeTab === "users" && renderUsers()}
          {activeTab === "donors" && renderDonors()}
          {activeTab === "hospitals" && renderHospitals()}
          {activeTab === "campaigns" && renderCampaigns()}
          {activeTab === "gallery" && renderGallery()}
          {activeTab === "team" && renderTeamManagement()}
          {activeTab === "chat" && renderChat()}
        </div>

        {/* Team Form Modal */}
        {showTeamForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Add Team Member</h3>
                  <button
                    onClick={() => setShowTeamForm(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={handleCreateTeamMember} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      required
                      value={teamForm.name}
                      onChange={(e) => setTeamForm({...teamForm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={teamForm.email}
                      onChange={(e) => setTeamForm({...teamForm, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      required
                      value={teamForm.password}
                      onChange={(e) => setTeamForm({...teamForm, password: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      value={teamForm.role}
                      onChange={(e) => setTeamForm({...teamForm, role: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="coordinator">Coordinator</option>
                      <option value="manager">Manager</option>
                      <option value="volunteer">Volunteer</option>
                      <option value="medical_staff">Medical Staff</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <input
                      type="text"
                      required
                      value={teamForm.department}
                      onChange={(e) => setTeamForm({...teamForm, department: e.target.value})}
                      placeholder="e.g., Emergency Response, Blood Bank"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={teamForm.phone}
                      onChange={(e) => setTeamForm({...teamForm, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea
                      value={teamForm.bio}
                      onChange={(e) => setTeamForm({...teamForm, bio: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowTeamForm(false)}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Create Member
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Channel Form Modal */}
        {showChannelForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Create Channel</h3>
                  <button
                    onClick={() => setShowChannelForm(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={handleCreateChannel} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Channel Name</label>
                    <input
                      type="text"
                      required
                      value={newChannelData.name}
                      onChange={(e) => setNewChannelData({...newChannelData, name: e.target.value})}
                      placeholder="e.g., general, emergency-team"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={newChannelData.description}
                      onChange={(e) => setNewChannelData({...newChannelData, description: e.target.value})}
                      placeholder="What's this channel for?"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Channel Type</label>
                    <select
                      value={newChannelData.type}
                      onChange={(e) => setNewChannelData({...newChannelData, type: e.target.value as 'public' | 'private'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowChannelForm(false)}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Create Channel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Campaign Form Modal */}
        {showCampaignForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Create Campaign</h3>
                  <button
                    onClick={() => setShowCampaignForm(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={handleCreateCampaign} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Title</label>
                      <input
                        type="text"
                        required
                        value={campaignForm.title}
                        onChange={(e) => setCampaignForm({...campaignForm, title: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="e.g., Emergency Blood Drive for Children's Hospital"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                      <input
                        type="text"
                        value={campaignForm.shortDescription}
                        onChange={(e) => setCampaignForm({...campaignForm, shortDescription: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Brief summary for cards and listings"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Description</label>
                      <textarea
                        required
                        value={campaignForm.description}
                        onChange={(e) => setCampaignForm({...campaignForm, description: e.target.value})}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Detailed description of the campaign, its purpose, and impact"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Target Blood Type</label>
                      <select
                        value={campaignForm.targetBloodType}
                        onChange={(e) => setCampaignForm({...campaignForm, targetBloodType: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="">All Blood Types</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority Level</label>
                      <select
                        value={campaignForm.priority}
                        onChange={(e) => setCampaignForm({...campaignForm, priority: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Target Location</label>
                      <input
                        type="text"
                        value={campaignForm.targetLocation}
                        onChange={(e) => setCampaignForm({...campaignForm, targetLocation: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="City, State or Region"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Target Goal (Donors)</label>
                      <input
                        type="number"
                        value={campaignForm.targetGoal}
                        onChange={(e) => setCampaignForm({...campaignForm, targetGoal: Number(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Number of donors needed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <input
                        type="datetime-local"
                        required
                        value={campaignForm.startDate}
                        onChange={(e) => setCampaignForm({...campaignForm, startDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <input
                        type="datetime-local"
                        required
                        value={campaignForm.endDate}
                        onChange={(e) => setCampaignForm({...campaignForm, endDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                      <input
                        type="tel"
                        required
                        value={campaignForm.contactInfo.phone}
                        onChange={(e) => setCampaignForm({
                          ...campaignForm, 
                          contactInfo: {...campaignForm.contactInfo, phone: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                      <input
                        type="email"
                        required
                        value={campaignForm.contactInfo.email}
                        onChange={(e) => setCampaignForm({
                          ...campaignForm, 
                          contactInfo: {...campaignForm.contactInfo, email: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCampaignForm(false)}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Create Campaign
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Photo Upload Modal */}
        {showPhotoForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Upload Photo</h3>
                  <button
                    onClick={() => setShowPhotoForm(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={handleUploadPhoto} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Photo Title</label>
                    <input
                      type="text"
                      required
                      value={photoForm.title}
                      onChange={(e) => setPhotoForm({...photoForm, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Blood Drive at City Hospital"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={photoForm.description}
                      onChange={(e) => setPhotoForm({...photoForm, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Brief description of the photo"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                    <input
                      type="url"
                      required
                      value={photoForm.imageUrl}
                      onChange={(e) => setPhotoForm({...photoForm, imageUrl: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={photoForm.category}
                      onChange={(e) => setPhotoForm({...photoForm, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="donation_drive">Donation Drive</option>
                      <option value="awareness">Awareness Campaign</option>
                      <option value="event">Event</option>
                      <option value="testimonial">Testimonial</option>
                    </select>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowPhotoForm(false)}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Upload Photo
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
