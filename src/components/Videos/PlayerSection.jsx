import React from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import 'videojs-hls-quality-selector';
import 'videojs-contrib-eme'; // For DRM support
import 'videojs-contrib-hls';
import 'videojs-youtube';
import CustomSettingsButton from './CustomSettingsButton';
import VideoJS from './VideoJS';

const PlayerSection = ({ sourceURL, token }) => {
  const playerRef = React.useRef(null);
  const typeOfVideo = sourceURL.includes('youtube') ? 'video/youtube' : 'application/x-mpegURL';
  let videoUrl = sourceURL;
  if (typeOfVideo === 'application/x-mpegURL') {
    videoUrl += `?bearerToken=${token}`;
  }

  const videoJsOptions = {
    autoplay: false,
    controls: true,
    responsive: true,
    fluid: true,
    sources: [
      {
        src: videoUrl,
        type: typeOfVideo,
        withCredentials: false,
      },
    ],
    html5: {
      vhs: {
        withCredentials: true, // For cross-origin requests with credentials
        overrideNative: true, // For HLS playback on Android 4.1+ and IE11
      },
     
    },
    playbackRates: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
    controlBar: {
      children: [
        'playToggle',
        'skipBackward',
        'skipForward',
        'volumePanel',
        'currentTimeDisplay',
        'progressControl',
        'durationDisplay',
        'remainingTimeDisplay',
        { name: 'CustomSettingsButton', typeOfVideo }, // Pass typeOfVideo as an option
        'fullscreenToggle'
      ]
    },
    youtube: { ytControls: 0 },
  };

  const handlePlayerReady = (player) => {
    playerRef.current = player;
    // if (typeOfVideo === 'application/x-mpegURL') {
    //   player.hlsQualitySelector();
    //   videojs.Vhs.xhr.beforeRequest = function (options) {
    //     options.headers = options.headers || {};
    //     options.headers['Authorization'] = `Bearer ${token}`;
    //     const url = new URL(options.uri);
    //     url.searchParams.set('bearerToken', `${token}`);
    //     options.uri = url.toString();
    //     return options;
    //   };
    // }
    // No need to add the CustomSettingsButton manually here
    player.on('waiting', () => {
      console.log('waiting');
    });
    player.on('dispose', () => {
      console.log('dispose');
    });
    player.on('error', () => {
      console.log('error');
    });
  };

  return (
    <div className='player-section'>
      
      <span className='top-layer'></span>
      <VideoJS options={videoJsOptions} onReady={handlePlayerReady} />
    </div>
  );
};

export default PlayerSection;
