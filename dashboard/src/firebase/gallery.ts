import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  uploadBytesResumable,
  UploadTaskSnapshot 
} from 'firebase/storage';
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
  Timestamp,
  deleteDoc,
  increment
} from 'firebase/firestore';
import { storage, db } from './config';

export interface GalleryImage {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  category: string;
  tags: string[];
  uploadedBy: string;
  uploaderName: string;
  uploadedAt: Timestamp;
  isActive: boolean;
  likes: number;
  views: number;
  fileSize: number;
  fileName: string;
  mimeType: string;
}

// Upload image to Firebase Storage and save metadata to Firestore
export const uploadImage = async (
  file: File,
  metadata: {
    title: string;
    description?: string;
    category: string;
    tags: string[];
    uploadedBy: string;
    uploaderName: string;
  },
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    // Create a unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `gallery/${timestamp}_${Math.random().toString(36).substring(7)}.${fileExtension}`;
    
    // Create storage reference
    const storageRef = ref(storage, fileName);
    
    // Upload file with progress tracking
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot: UploadTaskSnapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress?.(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          reject(error);
        },
        async () => {
          try {
            // Get download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            // Save metadata to Firestore
            const galleryRef = collection(db, 'galleryImages');
            const docRef = await addDoc(galleryRef, {
              ...metadata,
              imageUrl: downloadURL,
              uploadedAt: serverTimestamp(),
              isActive: true,
              likes: 0,
              views: 0,
              fileSize: file.size,
              fileName: file.name,
              mimeType: file.type,
            });
            
            resolve(docRef.id);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Get all gallery images (one-time fetch)
export const getAllGalleryImages = async (
  category?: string,
  imageLimit: number = 50
): Promise<GalleryImage[]> => {
  try {
    const galleryRef = collection(db, 'galleryImages');
    let q = query(
      galleryRef,
      where('isActive', '==', true),
      orderBy('uploadedAt', 'desc'),
      limit(imageLimit)
    );
    
    if (category && category !== 'all') {
      q = query(
        galleryRef,
        where('isActive', '==', true),
        where('category', '==', category),
        orderBy('uploadedAt', 'desc'),
        limit(imageLimit)
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as GalleryImage));
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    throw error;
  }
};

// Subscribe to gallery images (real-time)
export const subscribeToGalleryImages = (
  callback: (images: GalleryImage[]) => void,
  category?: string,
  imageLimit: number = 50
) => {
  const galleryRef = collection(db, 'galleryImages');
  let q = query(
    galleryRef,
    where('isActive', '==', true),
    orderBy('uploadedAt', 'desc'),
    limit(imageLimit)
  );
  
  if (category && category !== 'all') {
    q = query(
      galleryRef,
      where('isActive', '==', true),
      where('category', '==', category),
      orderBy('uploadedAt', 'desc'),
      limit(imageLimit)
    );
  }

  return onSnapshot(q, (snapshot) => {
    const images: GalleryImage[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as GalleryImage));
    
    callback(images);
  });
};

// Delete image from storage and Firestore
export const deleteImage = async (imageId: string, imageUrl: string): Promise<void> => {
  try {
    // Delete from Storage
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
    
    // Delete from Firestore
    const docRef = doc(db, 'galleryImages', imageId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

// Update image metadata
export const updateImageMetadata = async (
  imageId: string,
  updates: Partial<Pick<GalleryImage, 'title' | 'description' | 'category' | 'tags' | 'isActive'>>
): Promise<void> => {
  try {
    const docRef = doc(db, 'galleryImages', imageId);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.error('Error updating image metadata:', error);
    throw error;
  }
};

// Increment image views
export const incrementImageViews = async (imageId: string): Promise<void> => {
  try {
    const docRef = doc(db, 'galleryImages', imageId);
    await updateDoc(docRef, {
      views: increment(1),
    });
  } catch (error) {
    console.error('Error incrementing views:', error);
    // Don't throw error for view counting
  }
};

// Like/Unlike image
export const toggleImageLike = async (imageId: string, shouldIncrement: boolean): Promise<void> => {
  try {
    const docRef = doc(db, 'galleryImages', imageId);
    await updateDoc(docRef, {
      likes: shouldIncrement ? increment(1) : increment(-1),
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
};

// Get images by category
export const getImagesByCategory = async (category: string): Promise<GalleryImage[]> => {
  try {
    const galleryRef = collection(db, 'galleryImages');
    const q = query(
      galleryRef,
      where('isActive', '==', true),
      where('category', '==', category),
      orderBy('uploadedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as GalleryImage));
  } catch (error) {
    console.error('Error fetching images by category:', error);
    throw error;
  }
};

// Get image categories with counts
export const getImageCategories = async (): Promise<Array<{ category: string; count: number }>> => {
  try {
    const galleryRef = collection(db, 'galleryImages');
    const q = query(galleryRef, where('isActive', '==', true));
    
    const snapshot = await getDocs(q);
    const categoryMap = new Map<string, number>();
    
    snapshot.docs.forEach(doc => {
      const data = doc.data() as GalleryImage;
      const count = categoryMap.get(data.category) || 0;
      categoryMap.set(data.category, count + 1);
    });
    
    return Array.from(categoryMap.entries()).map(([category, count]) => ({
      category,
      count
    }));
  } catch (error) {
    console.error('Error fetching image categories:', error);
    throw error;
  }
};
