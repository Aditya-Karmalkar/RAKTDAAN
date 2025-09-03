import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  doc,
  updateDoc,
  getDocs,
  where,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from './config';

export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderEmail?: string;
  message: string;
  timestamp: Timestamp;
  type: 'text' | 'image' | 'file';
  attachmentUrl?: string;
  attachmentName?: string;
  edited?: boolean;
  editedAt?: Timestamp;
}

export interface ChatChannel {
  id: string;
  name: string;
  description?: string;
  type: 'public' | 'private' | 'team';
  createdBy: string;
  createdAt: Timestamp;
  memberCount: number;
  lastMessage?: {
    text: string;
    timestamp: Timestamp;
    senderName: string;
  };
  isActive: boolean;
}

// Send a message to a channel
export const sendMessage = async (
  channelId: string,
  senderId: string,
  senderName: string,
  message: string,
  senderEmail?: string,
  type: 'text' | 'image' | 'file' = 'text',
  attachmentUrl?: string,
  attachmentName?: string
): Promise<string> => {
  try {
    const messagesRef = collection(db, 'chatMessages');
    const docRef = await addDoc(messagesRef, {
      channelId,
      senderId,
      senderName,
      senderEmail,
      message,
      timestamp: serverTimestamp(),
      type,
      attachmentUrl,
      attachmentName,
      edited: false,
    });

    // Update channel's last message
    const channelRef = doc(db, 'chatChannels', channelId);
    await updateDoc(channelRef, {
      lastMessage: {
        text: message,
        timestamp: serverTimestamp(),
        senderName,
      },
    });

    return docRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Subscribe to messages in a channel (real-time)
export const subscribeToChannelMessages = (
  channelId: string,
  callback: (messages: ChatMessage[]) => void,
  messageLimit: number = 50
) => {
  const messagesRef = collection(db, 'chatMessages');
  const q = query(
    messagesRef,
    where('channelId', '==', channelId),
    orderBy('timestamp', 'desc'),
    limit(messageLimit)
  );

  return onSnapshot(q, (snapshot) => {
    const messages: ChatMessage[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ChatMessage)).reverse(); // Reverse to get chronological order
    
    callback(messages);
  });
};

// Get messages for a channel (one-time fetch)
export const getChannelMessages = async (
  channelId: string,
  messageLimit: number = 50
): Promise<ChatMessage[]> => {
  try {
    const messagesRef = collection(db, 'chatMessages');
    const q = query(
      messagesRef,
      where('channelId', '==', channelId),
      orderBy('timestamp', 'desc'),
      limit(messageLimit)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ChatMessage)).reverse();
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

// Create a new chat channel
export const createChatChannel = async (
  name: string,
  description: string,
  type: 'public' | 'private' | 'team',
  createdBy: string
): Promise<string> => {
  try {
    const channelsRef = collection(db, 'chatChannels');
    const docRef = await addDoc(channelsRef, {
      name,
      description,
      type,
      createdBy,
      createdAt: serverTimestamp(),
      memberCount: 1,
      isActive: true,
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating channel:', error);
    throw error;
  }
};

// Subscribe to channels (real-time)
export const subscribeToChannels = (
  callback: (channels: ChatChannel[]) => void,
  type?: 'public' | 'private' | 'team'
) => {
  const channelsRef = collection(db, 'chatChannels');
  let q = query(channelsRef, where('isActive', '==', true), orderBy('createdAt', 'desc'));
  
  if (type) {
    q = query(channelsRef, where('isActive', '==', true), where('type', '==', type), orderBy('createdAt', 'desc'));
  }

  return onSnapshot(q, (snapshot) => {
    const channels: ChatChannel[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ChatChannel));
    
    callback(channels);
  });
};

// Get all channels (one-time fetch)
export const getAllChannels = async (type?: 'public' | 'private' | 'team'): Promise<ChatChannel[]> => {
  try {
    const channelsRef = collection(db, 'chatChannels');
    let q = query(channelsRef, where('isActive', '==', true), orderBy('createdAt', 'desc'));
    
    if (type) {
      q = query(channelsRef, where('isActive', '==', true), where('type', '==', type), orderBy('createdAt', 'desc'));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ChatChannel));
  } catch (error) {
    console.error('Error fetching channels:', error);
    throw error;
  }
};

// Edit a message
export const editMessage = async (messageId: string, newMessage: string): Promise<void> => {
  try {
    const messageRef = doc(db, 'chatMessages', messageId);
    await updateDoc(messageRef, {
      message: newMessage,
      edited: true,
      editedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error editing message:', error);
    throw error;
  }
};

// Update channel member count
export const updateChannelMemberCount = async (channelId: string, count: number): Promise<void> => {
  try {
    const channelRef = doc(db, 'chatChannels', channelId);
    await updateDoc(channelRef, {
      memberCount: count,
    });
  } catch (error) {
    console.error('Error updating member count:', error);
    throw error;
  }
};
