import { useWindowDimensions, View, StyleSheet } from 'react-native';
import { cld } from '../lib/cloudinary';
import { thumbnail, scale } from '@cloudinary/url-gen/actions/resize';
import { AdvancedImage } from 'cloudinary-react-native';
import { VideoView, useVideoPlayer } from 'expo-video';

interface Post {
    media_type: string;
    id: string;
    image: string;
    image_url: string;
    caption: string;
}

export default function PostContent({ post }: { post: Post }) {
  const { width } = useWindowDimensions();

  if (post.media_type === 'image') {
    const image = cld.image(post.image);
    image.resize(thumbnail().width(width).height(width));

    return <AdvancedImage cldImg={image} style={styles.image} className="w-full aspect-[4/3]" />;
  }

  if (post.media_type === 'video') {
    const video = cld.video(post.image);
    video.resize(scale().width(500));

    const player = useVideoPlayer(video.toURL());

    return (
      <View
        style={styles.videoContainer}
      >
        <VideoView
          style={styles.video}
          player={player}
          contentFit="cover"
          allowsFullscreen
          allowsPictureInPicture
          nativeControls
        />
      </View>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  videoContainer: {
    width: '90%',
    aspectRatio: 12 / 16,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    margin: 'auto',
  },
  video: {
    flex: 1,
  },
  image: {
    width: '90%',
    aspectRatio: 4 / 3,
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    margin: 'auto',
  },
});