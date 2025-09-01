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
    <div className="space-y-8">
      {/* Real-time Status Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">Blood Donation Platform Dashboard</h2>
            <p className="text-blue-100">Real-time monitoring and analytics</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-100">Last Updated</div>
            <div className="text-lg font-semibold">
              {realTimeData?.lastUpdated ? new Date(realTimeData.lastUpdated).toLocaleTimeString() : "Loading..."}
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {renderAnalyticsCard(
          "Active Users", 
          realTimeData?.totalUsers || 0, 
          "👥", 
          "border-l-blue-500", 
          `+${realTimeData?.recentUsers || 0} today`
        )}
        {renderAnalyticsCard(
          "Total Donors", 
          realTimeData?.totalDonors || 0, 
          "❤️", 
          "border-l-red-500", 
          `${realTimeData?.availableDonors || 0} available`
        )}
        {renderAnalyticsCard(
          "Verified Hospitals", 
          realTimeData?.verifiedHospitals || 0, 
          "🏥", 
          "border-l-green-500", 
          `${realTimeData?.totalHospitals || 0} total`
        )}
        {renderAnalyticsCard(
          "Active SOS Alerts", 
          realTimeData?.activeSosAlerts || 0, 
          "🚨", 
          "border-l-orange-500", 
          `${realTimeData?.responseRate || 0}% response rate`
        )}
      </div>

      {/* Live Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">⚡</span>
            Live Activity Feed
          </h3>
          <div className="space-y-4">
            {realTimeData?.recentUsers > 0 && (
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-blue-800">
                  {realTimeData.recentUsers} new users registered today
                </span>
              </div>
            )}
            {realTimeData?.recentAlerts > 0 && (
              <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-red-800">
                  {realTimeData.recentAlerts} SOS alerts created today
                </span>
              </div>
            )}
            {realTimeData?.recentResponses > 0 && (
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-800">
                  {realTimeData.recentResponses} donor responses today
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">📊</span>
            System Health
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {realTimeData?.systemHealth?.uptime || 99.9}%
              </div>
              <div className="text-sm text-gray-600">Uptime</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {realTimeData?.systemHealth?.avgResponseTime || 2.3}s
              </div>
              <div className="text-sm text-gray-600">Avg Response</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {realTimeData?.systemHealth?.activeConnections || 75}
              </div>
              <div className="text-sm text-gray-600">Active Connections</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {realTimeData?.systemHealth?.serverLoad || 25}%
              </div>
              <div className="text-sm text-gray-600">Server Load</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setShowCampaignForm(true)}
            className="flex items-center justify-center p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105"
          >
            <span className="mr-2">📢</span>
            Create Campaign
          </button>
          <button
            onClick={() => setShowPhotoForm(true)}
            className="flex items-center justify-center p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
          >
            <span className="mr-2">📸</span>
            Upload Photo
          </button>
          <button
            onClick={() => setActiveTab("donors")}
            className="flex items-center justify-center p-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105"
          >
            <span className="mr-2">❤️</span>
            Verify Donors
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className="flex items-center justify-center p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
          >
            <span className="mr-2">⚡</span>
            Live Analytics
          </button>
        </div>
      </div>
    </div>
  );

  // Real-time Analytics Dashboard
  const renderRealTimeAnalytics = () => (
    <div className="space-y-8">
      {/* Real-time Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">Real-time Analytics</h2>
            <p className="text-purple-100">Live monitoring and insights</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Live</span>
          </div>
        </div>
      </div>

      {/* Blood Type Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Blood Type Distribution</h3>
          <div className="space-y-3">
            {realTimeData?.bloodTypeDistribution && Object.entries(realTimeData.bloodTypeDistribution).map(([type, count]) => (
              <div key={type} className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{type}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ 
                        width: `${realTimeData.totalDonors > 0 ? ((count as number) / realTimeData.totalDonors) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{count as number}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alert Urgency Levels</h3>
          <div className="space-y-3">
            {realTimeData?.urgencyDistribution && Object.entries(realTimeData.urgencyDistribution).map(([urgency, count]) => (
              <div key={urgency} className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 capitalize">{urgency}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        urgency === 'critical' ? 'bg-red-600' :
                        urgency === 'urgent' ? 'bg-orange-500' :
                        urgency === 'normal' ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                      style={{ 
                        width: `${realTimeData.totalSosAlerts > 0 ? ((count as number) / realTimeData.totalSosAlerts) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{count as number}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Growth Trends */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Growth Trends</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-4">User Registration Trend</h4>
            <div className="space-y-3">
              {realTimeData?.userGrowthTrend?.map((trend: any) => (
                <div key={trend.period} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Last {trend.period}</span>
                  <span className="text-lg font-semibold text-blue-600">+{trend.count}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-4">SOS Alert Trend</h4>
            <div className="space-y-3">
              {realTimeData?.alertTrend?.map((trend: any) => (
                <div key={trend.period} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Last {trend.period}</span>
                  <span className="text-lg font-semibold text-red-600">+{trend.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-green-600">{realTimeData?.responseRate || 0}%</div>
          <div className="text-sm text-gray-600 mt-1">Response Rate</div>
          <div className="text-xs text-green-600 mt-1">
            {realTimeData?.responseRate > 80 ? "↗ Excellent" : realTimeData?.responseRate > 60 ? "→ Good" : "↘ Needs Improvement"}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-blue-600">{realTimeData?.availableDonors || 0}</div>
          <div className="text-sm text-gray-600 mt-1">Available Donors</div>
          <div className="text-xs text-blue-600 mt-1">Ready to donate</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-purple-600">{realTimeData?.verifiedHospitals || 0}</div>
          <div className="text-sm text-gray-600 mt-1">Verified Hospitals</div>
          <div className="text-xs text-purple-600 mt-1">Trusted partners</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-orange-600">{realTimeData?.activeSosAlerts || 0}</div>
          <div className="text-sm text-gray-600 mt-1">Active Alerts</div>
          <div className="text-xs text-orange-600 mt-1">Urgent needs</div>
        </div>
      </div>
    </div>
  );

  const renderAnalyticsCard = (title: string, value: number, icon: string, color: string, subtitle?: string) => (
    <div className={`bg-white rounded-xl shadow-md border-l-4 ${color} p-6 transform hover:scale-105 transition-all duration-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="text-4xl">
          {icon}
        </div>
      </div>
    </div>
  );

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
    <div className="space-y-8">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {renderAnalyticsCard("Total Users", analyticsData.totalUsers, "👥", "border-l-blue-500", "Registered users")}
        {renderAnalyticsCard("Hospitals", analyticsData.totalHospitals, "🏥", "border-l-green-500", `${analyticsData.verifiedHospitals} verified`)}
        {renderAnalyticsCard("SOS Alerts", analyticsData.totalAlerts, "🚨", "border-l-red-500", `${analyticsData.activeAlerts} active`)}
        {renderAnalyticsCard("Team Members", analyticsData.totalTeamMembers, "👨‍💼", "border-l-purple-500", "Active staff")}
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team by Department</h3>
          <div className="space-y-3">
            {Object.entries(analyticsData.departmentStats).map(([dept, count]) => (
              <div key={dept} className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 capitalize">{dept}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${analyticsData.totalTeamMembers > 0 ? ((count as number) / analyticsData.totalTeamMembers) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{count as number}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">System running smoothly</p>
                <p className="text-xs text-gray-500">All services operational</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm">🏥</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{analyticsData.totalHospitals} hospitals registered</p>
                <p className="text-xs text-gray-500">{analyticsData.verifiedHospitals} verified</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-sm">👥</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{analyticsData.totalTeamMembers} team members active</p>
                <p className="text-xs text-gray-500">Across {Object.keys(analyticsData.departmentStats).length} departments</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setShowTeamForm(true)}
            className="flex items-center justify-center p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
          >
            <span className="mr-2">👥</span>
            Add Team Member
          </button>
          <button
            onClick={() => setShowChannelForm(true)}
            className="flex items-center justify-center p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105"
          >
            <span className="mr-2">💬</span>
            Create Channel
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className="flex items-center justify-center p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
          >
            <span className="mr-2">📊</span>
            View Analytics
          </button>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-8">
      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {renderAnalyticsCard("Growth Rate", 15, "📈", "border-l-green-500", "+15% this month")}
        {renderAnalyticsCard("Response Time", 3, "⏱️", "border-l-yellow-500", "Average minutes")}
        {renderAnalyticsCard("Success Rate", 98, "✅", "border-l-green-500", "98% success rate")}
      </div>

      {/* Detailed Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Performance</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">User Registration</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: "75%" }}></div>
                </div>
                <span className="text-sm font-semibold text-gray-900">75%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Hospital Verification</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: "90%" }}></div>
                </div>
                <span className="text-sm font-semibold text-gray-900">90%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Alert Response</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: "95%" }}></div>
                </div>
                <span className="text-sm font-semibold text-gray-900">95%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">99.9%</div>
              <div className="text-sm text-gray-600">Uptime</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">2.3s</div>
              <div className="text-sm text-gray-600">Avg Response</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{analyticsData.totalUsers}</div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">24/7</div>
              <div className="text-sm text-gray-600">Monitoring</div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">{analyticsData.totalUsers}</div>
            <div className="text-sm text-gray-600">Total Users</div>
            <div className="text-xs text-green-600 mt-1">↗ +12% from last month</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-3xl font-bold text-green-600">{analyticsData.verifiedHospitals}</div>
            <div className="text-sm text-gray-600">Verified Hospitals</div>
            <div className="text-xs text-green-600 mt-1">↗ +8% from last month</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-3xl font-bold text-red-600">{analyticsData.activeAlerts}</div>
            <div className="text-sm text-gray-600">Active Alerts</div>
            <div className="text-xs text-gray-600 mt-1">Real-time monitoring</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">{analyticsData.totalTeamMembers}</div>
            <div className="text-sm text-gray-600">Team Members</div>
            <div className="text-xs text-green-600 mt-1">↗ +5% from last month</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTeamManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Team Management</h3>
        <button
          onClick={() => setShowTeamForm(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Add Team Member
        </button>
      </div>

      {/* Team Members List */}
      <div className="bg-white rounded-lg shadow-sm border border-red-100">
        <div className="p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">Current Team Members</h4>
          <div className="space-y-4">
            {Array.isArray(teamMembers) && teamMembers.map((member: any) => (
              <div key={member._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h5 className="font-medium text-gray-900">{member.name}</h5>
                  <p className="text-sm text-gray-600">{member.email}</p>
                  <p className="text-sm text-gray-500">{member.role} - {member.department}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    member.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {member.status}
                  </span>
                  <span className="text-sm text-gray-500">{member.phone}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Form Modal */}
      {showTeamForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Team Member</h3>
            <form onSubmit={handleCreateTeamMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={teamForm.name}
                  onChange={(e) => setTeamForm({...teamForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={teamForm.email}
                  onChange={(e) => setTeamForm({...teamForm, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={teamForm.password}
                  onChange={(e) => setTeamForm({...teamForm, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={teamForm.role}
                  onChange={(e) => setTeamForm({...teamForm, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  required
                  value={teamForm.phone}
                  onChange={(e) => setTeamForm({...teamForm, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  value={teamForm.bio}
                  onChange={(e) => setTeamForm({...teamForm, bio: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Create Member
                </button>
              </div>
            </form>
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
