import { Cloudinary } from '@cloudinary/url-gen';
import * as FileSystem from 'expo-file-system';


// Create a Cloudinary instance and set your cloud name.
export const cld = new Cloudinary({
  cloud: {
    cloudName: 'dpai9bmyo',
  },
});


export const uploadImage = async (fileUri: string): Promise<any> => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        throw new Error('File does not exist at the specified path');
      }
  
      const base64Data = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
  
      const formData = new FormData();
      formData.append('file', `data:video/mp4;base64,${base64Data}`); // Anpassa MIME-typen
      formData.append('upload_preset', 'Default'); // Ändra till ditt uppladdningspreset
  
      const response = await fetch('https://api.cloudinary.com/v1_1/dpai9bmyo/upload', {
        method: 'POST',
        body: formData,
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        throw new Error(result.error?.message || 'Upload failed');
      }
  
      console.log('Upload successful:', result);
      return result;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };