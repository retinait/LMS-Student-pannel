import React from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "videojs-hls-quality-selector";
import "videojs-contrib-quality-levels";
import "videojs-youtube";
import videojsContribEme from "videojs-contrib-eme";
import CustomSettingsButton from "./CustomSettingsButton";
import { useEffect, useState, useRef } from "react";
import Cookies, { get } from "js-cookie";
import PauseIcon from "../../assets/images/icons-pause.png";
import DynamicWatermark from "videojs-dynamic-watermark";
import {
  fairplayCertUri,
  licenseUri,
  arrayToString,
  base64EncodeUint8Array,
  base64DecodeUint8Array,
} from "./pallycon-sample-helper";

let currentTime = new Date().getTime();
const PlayerSection = ({
  open,
  sourceURL,
  sourceKey,
  onProgress,
  onEnded,
  intervalID,
  playerRef,
  accessToken,
  drmInfo,
}) => {
  //console.log(sourceURL);

  const videoRef = useRef(null);
  const [left, setLeft] = React.useState(0);
  const [top, setTop] = React.useState(0);
  const [showScrollableName, setShowScrollableName] = React.useState(true);
  const student = JSON.parse(localStorage.getItem("student"));

  let videoUrl = sourceURL;
  let typeOfVideo = sourceURL.includes("youtube")
    ? "video/youtube"
    : "application/x-mpegURL";
  // if(sourceURL.includes("m3u8")){
  //   typeOfVideo = "application/x-mpegURL";
  // }

  if (drmInfo && drmInfo.drmType === "FairPlay") {
    typeOfVideo = "application/x-mpegURL";
    videoUrl = sourceURL.replace(".mpd", ".m3u8");
  }

  //console.log("Type of Video", typeOfVideo);
  let videoJsOptions = {
    autoplay: false,
    controls: true,
    responsive: true,
    fluid: true,
    preload: "auto",
    sources: [
      {
        src: videoUrl,
        type: typeOfVideo,
      },
    ],
    html5: {
      vhs: {
        overrideNative: true,
        withCredentials: true,
      },
      hls: {
        overrideNative: true,

      }
    },
    playbackRates: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
    controlBar: {
      children: [
        "playToggle",
        "skipBackward",
        "skipForward",
        "volumePanel",
        "currentTimeDisplay",
        "progressControl",
        "durationDisplay",
        "remainingTimeDisplay",
        "CustomSettingsButton", // Add the custom settings button here
        "fullscreenToggle",
      ],
      skipButtons: {
        forward: 10,
        backward: 10,
      },
    },
    youtube: { ytControls: 0 },
  };

  function configureDRM(player) {
    player.ready(function () {
      let playerConfig;
      player.eme();
      if ("FairPlay" === drmInfo.drmType) {
        console.log("Playing fairplay");
        const hls = sourceURL.replace(".mpd", ".m3u8");
        console.log("hls", hls);
        playerConfig = {
          src: hls,
          type: "application/x-mpegurl",
          keySystems: {
            "com.apple.fps.1_0": {
              getCertificate: function (emeOptions, callback) {
                console.log("get certificate");
                videojs.xhr(
                  {
                    url: fairplayCertUri,
                    method: "GET",
                  },
                  function (err, response, responseBody) {
                    if (err) {
                      callback(err);
                      return;
                    }
                    callback(null, base64DecodeUint8Array(responseBody));
                  }
                );
              },
              getContentId: function (emeOptions, initData) {
                const contentId = arrayToString(initData);
                return contentId.substring(contentId.indexOf("skd://") + 6);
              },
              getLicense: function (
                emeOptions,
                contentId,
                keyMessage,
                callback
              ) {
                videojs.xhr(
                  {
                    url: licenseUri,
                    method: "POST",
                    responseType: "text",
                    body: "spc=" + base64EncodeUint8Array(keyMessage),
                    headers: {
                      "Content-type": "application/x-www-form-urlencoded",
                      "pallycon-customdata-v2": drmInfo.encryptionToken,
                    },
                  },
                  function (err, response, responseBody) {
                    if (err) {
                      callback(err);
                      return;
                    }
                    callback(null, base64DecodeUint8Array(responseBody));
                  }
                );
              },
            },
          },
        };
      } else if ("PlayReady" === drmInfo.drmType) {
        playerConfig = {
          src: videoUrl,
          type: "application/dash+xml",
          keySystems: {
            "com.microsoft.playready": {
              url: licenseUri,
              licenseHeaders: {
                "pallycon-customdata-v2": drmInfo.encryptionToken,
              },
            },
          },
        };
      } else if ("Widevine" === drmInfo.drmType) {
        playerConfig = {
          src: videoUrl,
          // type: 'application/x-mpegurl',
          type: "application/dash+xml",
          keySystems: {
            "com.widevine.alpha": {
              url: licenseUri,
              licenseHeaders: {
                "pallycon-customdata-v2": drmInfo.encryptionToken,
              },
              persistentState: "required",
            },
          },
        };
        console.log("Widevine is playing");
      } else {
        console.log("No DRM supported in this browser");
      }
      player.src(playerConfig);
    });
  }

  function isIphone() {
    return /iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  useEffect(() => {
    if (
      typeOfVideo === "application/x-mpegURL" ||
      typeOfVideo === "application/dash+xml"
    ) {
      //console.log("VOD");
      // if(accessToken){
      console.log("Access Token", accessToken);
      isIphone() &&
        Cookies.set("accessToken", accessToken, {
          path: "/",
          domain: ".retinalms.com",
          secure: true,
          sameSite: "None",
        });
      initializePlayer();
    } else {
      //console.log("YOU TUBE");
      initializePlayer();
    }
  }, [playerRef, drmInfo, accessToken, sourceURL]);

  videojs["Vhs"].xhr.beforeRequest = function (options) {
    //console.log("Before Request", options);
    console.log("Bearer Token", accessToken);

    options.headers = options.headers || {};
    options.headers["Authorization"] = `Bearer ${accessToken}`;
    //   var url = new URL(options.uri);
    //  url.searchParams.set('bearerToken', `${accessToken}`);
    //   console.log("URL", url.toString());
    //   options.uri = url.toString();
    return options;
  };

  const initializePlayer = async () => {
    console.log("Initializing Player", drmInfo);
    if ((drmInfo && accessToken) || typeOfVideo === "video/youtube")
      if (playerRef && playerRef.current) {
        // console.log("Player Already Initialized")
        //  playerRef.current.src({src: `${videoUrl}?bearerToken=${accessToken}`, type: typeOfVideo});
      } else {
        const videoElement = document.createElement("video-js");
        videoElement.classList.add("vjs-big-play-centered");
        videoRef.current.appendChild(videoElement);
        videojs.registerPlugin("eme", videojsContribEme);
        videojs.registerPlugin("dynamicWatermark", DynamicWatermark);
        if (drmInfo?.drmType === "FairPlay") {
          videoJsOptions = {
            ...videoJsOptions,
            html5: {
              xhr: {
                overrideNative: true,
                withCredentials: true,
              },
            },
          };
        }
        console.log("Video JS Options", videoJsOptions);
        const player = (playerRef.current = videojs(
          videoElement,
          videoJsOptions,
          () => {
            videojs.log("player is ready");
          }
        ));

        player.ready(function () {
          if (drmInfo?.drmVersion === "1") {
            configureDRM(player);
          }
        });

        player.dynamicWatermark({
          elementId: "unique_id",
          watermarkText: `${student && student.username}`,  //<br /> ${student && student.sid}
          changeDuration: 10000,
          cssText:
            "display: block; color: white; background-color: transparent; font-size: 9px; line-height:20px; z-index: 9999; position: absolute;",
        });

        player.hlsQualitySelector({
          displayCurrentQuality: true,
        });

        //player.play();
        handlePlayerReady(player);
      }
  };

  // useEffect(() => {
  //   const handleKeyPress = (event) => {
  //     if (event.code === 'Space') {
  //       console.log('Space button pressed');
  //       if(playerRef.current.paused()){
  //         playerRef.current.play();
  //       }
  //       else{
  //         playerRef.current.pause();
  //       }
  //       // Add your logic here
  //     }
  //   };

  //   window.addEventListener('keydown', handleKeyPress);

  //   // Cleanup the event listener on component unmount
  //   return () => {
  //     window.removeEventListener('keydown', handleKeyPress);
  //   };
  // }, []);

  const isMobileDevice = () => {
    return /Mobi|Android/i.test(navigator.userAgent);
  };

  const checkIfMenuShowing = () => {
    const element = document.querySelector(".vjs-settings-menu-container");
    if (element) {
      const displayStyle = window.getComputedStyle(element).display;
      return displayStyle === "block";
    }
    return false;
  };

  const handlePlayerReady = (player) => {
    // You can handle player events here, for example:
    if (!player) return;

    console.log("Player Ready", player);
    player.on("loadedmetadata", () => {
      console.log('player is loaded metadata');
      if (isIphone()) {

        console.log('Iphone');
      }
      else {
        player.play();
      }
    });

    const qualityLevels = player.qualityLevels();

    qualityLevels.on("change", function (event) {
      //console.log('quality level changed', event);
    });

    qualityLevels.on("change", function (event) {
      console.log("quality level changed", event);
    });

    // Listen for quality level changes and adjust accordingly

    player.on("waiting", () => {
      videojs.log("player is waiting");
    });

    player.on("error", () => {
      const error = player.error();
      console.error("Video.js error:", error);
    });

    player.on("progress", (e) => {
      onProgress(parseInt((player.currentTime() / player.duration()) * 100));
    });

    // player.on('play', () => {
    //   console.log('player is playing', Settings.get('showSettings'));
    //   // if(Settings.get('showSettings')){
    //   //   Settings.set('showSettings', false);
    //   //   player.pause();
    //   // }
    //   document.querySelector('.vjs-settings-menu-container').style.display = 'none';
    //   console.log('play',document.querySelector('.vjs-settings-menu-container'));

    // }

    // );

    // player.on('pause', () => {
    //   videojs.log('player is paused', Settings.get('showSettings'));
    //   document.querySelector('.vjs-settings-menu-container').style.display = 'none';
    //   console.log('play',document.querySelector('.vjs-settings-menu-container'));
    //   if(Settings.get('showSettings')){
    //     //Settings.set('showSettings', false);
    //     player.play();
    //     Settings.set('showSettings', false);
    //   }

    // }
    // );

    player.on("play", () => {
      document.querySelector(".vjs-big-play-button").style.display = "none";
      document.querySelector(".vjs-pause-icon").style.display = "flex";
      document.querySelector(".vjs-forward-icon").style.display = "block";
      document.querySelector(".vjs-backward-icon").style.display = "block";
      // const scrollInterval = setInterval(() => {
      //   setShowScrollableName(false);
      //   setTimeout(() => {
      //     setLeft(Math.floor(Math.random() * 90));
      //     setTop(Math.floor(Math.random() * 90));
      //     setShowScrollableName(true);
      //   }, 0);
      // }, 200000);

      playerRef.current.on("pause", () => {
        // clearInterval(scrollInterval);
        // setShowScrollableName(false);
      });
    });

    player.on("pause", () => {
      document.querySelector(".vjs-pause-icon").style.display = "none";
      document.querySelector(".vjs-forward-icon").style.display = "none";
      document.querySelector(".vjs-backward-icon").style.display = "none";
      document.querySelector(".vjs-big-play-button").style.display = "flex";
    });

    // Listen for user active and inactive events
    player.on("useractive", () => {
      if (!player.paused()) {
        document.querySelector(".vjs-pause-icon").style.display = "flex";
        document.querySelector(".vjs-backward-icon").style.display = "block";
        document.querySelector(".vjs-forward-icon").style.display = "block";
      }
    });

    player.on("userinactive", () => {
      document.querySelector(".vjs-pause-icon").style.display = "none";
      document.querySelector(".vjs-backward-icon").style.display = "none";
      document.querySelector(".vjs-forward-icon").style.display = "none";
    });

    player.on("ended", () => {
      videojs.log("player is ended");
      onEnded();
    });

    player.on("error", (error) => {
      videojs.log("player is error", error);
    });

    player.on("dispose", () => {
      videojs.log("player will dispose");
      console.log("player disposed", player.isDisposed(), intervalID);
      clearInterval(intervalID);
      //remove all event listeners
      player.off("loadedmetadata");
      player.off("waiting");
      player.off("progress");
      player.off("play");
      player.off("pause");
      player.off("ended");
      player.off("error");
      player.off("dispose");
      // console.log('player disposed', player.isDisposed);
      playerRef.current = null;
      player = null;
    });

    const pauseIcon = document.querySelector(".vjs-pause-icon");
    if (pauseIcon) {
      pauseIcon.addEventListener("click", () => {
        if (!player.paused()) {
          player.pause();
        }
      });
    }

    // document.addEventListener('keydown', (event) => {

    //   if(!player) return;
    //   if(player && player.isDisposed())return;
    //   if (event.code === 'Space') {
    //     if (player.paused()) {
    //       player.play();
    //     } else {
    //       player.pause();
    //     }
    //   }
    // });

    // // Add touch event listeners for single tap play/pause and double tap forward/backward
    // let lastTapTime = 0;
    // let tapTimeout = null;

    // const handleSingleTap = () => {
    //   if (player.paused()) {
    //     player.play();
    //   } else {
    //     player.pause();
    //   }
    // };

    // const handleDoubleTap = (event) => {
    //   const touchX = event.changedTouches[0].clientX;
    //   const videoWidth = player.el().offsetWidth;
    //   const thirdOfScreen = videoWidth / 3;

    //   if (touchX < thirdOfScreen) {
    //     player.currentTime(player.currentTime() - 10); // Backward 10 seconds
    //   } else if (touchX > 2 * thirdOfScreen) {
    //     player.currentTime(player.currentTime() + 10); // Forward 10 seconds
    //   }
    // };

    // const tapHandler = (event) => {
    //   const currentTime = new Date().getTime();
    //   const tapInterval = currentTime - lastTapTime;

    //   clearTimeout(tapTimeout);

    //   if (tapInterval < 300 && tapInterval > 0) {
    //     handleDoubleTap(event);
    //   } else {
    //     tapTimeout = setTimeout(() => {
    //       // Only handle single tap if the target is not a control element or settings menu
    //       const target = event.target;
    //       console.log('single tap', Settings.get('showSettings'));
    //       if (!target.closest('.vjs-control') && !target.closest('.vjs-settings-menu') && !target.closest('.vjs-settings-menu-item')) {

    //         if(!Settings.get('showSettings'))
    //           //Settings.set('showSettings', false);
    //           handleSingleTap();
    //           Settings.set('showSettings', false);
    //       }
    //     }, 300);
    //   }

    //   lastTapTime = currentTime;
    // };

    // // If on a mobile device, disable vjs-big-play-button functionality
    // if (isMobileDevice()) {
    //   const bigPlayButton = player.getChild('bigPlayButton');
    //   if (bigPlayButton) {
    //     bigPlayButton.off('click');
    //     bigPlayButton.off('touchend');
    //   }
    // }

    // player.el().addEventListener('touchend', tapHandler);

    // // Prevent clicks on the settings menu from propagating
    // document.querySelector('.vjs-settings-menu-container').addEventListener('click', (event) => {
    //   event.stopPropagation();
    // });

    document.addEventListener("keydown", (event) => {
      if (event.code === "Space") {
        if (player.paused()) {
          player.play();
        } else {
          player.pause();
        }
      }
    });

    // Prevent clicks on the settings menu from propagating
    document
      .querySelector(".vjs-settings-menu-container")
      .addEventListener("click", (event) => {
        event.stopPropagation();
      });
    document
      .querySelector(".vjs-forward-icon")
      .addEventListener("click", () => {
        // console.log('double clicked',currentTime);
        if (new Date().getTime() - currentTime < 300) {
          player.currentTime(player.currentTime() + 10);
        }
        currentTime = new Date().getTime();
      });

    document
      .querySelector(".vjs-backward-icon")
      .addEventListener("click", () => {
        // console.log('double clicked',currentTime);
        if (new Date().getTime() - currentTime < 300) {
          player.currentTime(player.currentTime() - 10);
        }
        currentTime = new Date().getTime();
      });

    document
      .querySelector(".vjs-backward-icon")
      .addEventListener("click", () => {
        console.log("double clicked", currentTime);
        if (new Date().getTime() - currentTime < 300) {
          player.currentTime(player.currentTime() - 10);
        }
        currentTime = new Date().getTime();
      });
  };

  return (
    <div className="player-section">
      <div ref={videoRef} />
      <div className="vjs-pause-icon" id="pause-icon">
        <img src={PauseIcon} alt="Pause Icon" />
      </div>
      <div className="vjs-backward-icon" id="vjs-backward-icon"></div>
      <div className="vjs-forward-icon" id="vjs-forward-icon"></div>
    </div>
  );
};

export default PlayerSection;
