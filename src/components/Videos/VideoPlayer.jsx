import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import videojsContribEme from 'videojs-contrib-eme';
import { licenseUri, fairplayCertUri, checkSupportedDRM } from './pallycon-sample-helper';


const VideoPlayer = ({ 
    drmType="FairPlay", 
    hlsUri, 
    fairplayToken, 

}) => {
    const videoNode = useRef(null);
    const playerRef = useRef(null);

    useEffect(() => {
        // Initialize VideoJS player
        if(hlsUri && fairplayToken){
           // var player = videojs('my-player');
           videojs.registerPlugin('eme', videojsContribEme);
            const player = playerRef.current = videojs(videoNode.current, {}, () => {
                console.log("player")
            }
            );
            

            checkSupportedDRM().then(() => {
               // checkBrowser();
                player.ready(function(){
                    console.log('player ready', player)
                    configureDRM(player);
                });
               // player.play();
            })
           
    
            // Cleanup on unmount
            
        }
       
    }, [hlsUri, fairplayToken]);

    function arrayToString(array) {
        var uint16array = new Uint16Array(array.buffer);
        return String.fromCharCode.apply(null, uint16array);
      }
      
      function arrayBufferToString(buffer) {
        var arr = new Uint8Array(buffer);
        var str = String.fromCharCode.apply(String, arr);
        // if(/[\u0080-\uffff]/.test(str)){
        //     throw new Error("this string seems to contain (still encoded) multibytes");
        // }
        return str;
      }
      
      function base64DecodeUint8Array(input) {
        var raw = window.atob(input);
        var rawLength = raw.length;
        var array = new Uint8Array(new ArrayBuffer(rawLength));
      
        for (let i = 0; i < rawLength; i++) array[i] = raw.charCodeAt(i);
      
        return array;
      }
      
      function base64EncodeUint8Array(input) {
        var keyStr =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
      
        while (i < input.length) {
          chr1 = input[i++];
          chr2 = i < input.length ? input[i++] : Number.NaN;
          chr3 = i < input.length ? input[i++] : Number.NaN;
      
          enc1 = chr1 >> 2;
          enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
          enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
          enc4 = chr3 & 63;
      
          if (isNaN(chr2)) {
            enc3 = enc4 = 64;
          } else if (isNaN(chr3)) {
            enc4 = 64;
          }
          output +=
            keyStr.charAt(enc1) +
            keyStr.charAt(enc2) +
            keyStr.charAt(enc3) +
            keyStr.charAt(enc4);
        }
        return output;
      }

      function configureDRM(player) {
        player.ready(function () {
            let playerConfig;
            player.eme();
            if ('FairPlay' === drmType) {
                console.log("Playing fairplay")
                const hls = hlsUri.replace(".mpd", ".m3u8");
                console.log("hls", hls)
                playerConfig = {
                    src: hls,
                    type: 'application/x-mpegurl',
                    keySystems: {
                        'com.apple.fps.1_0': {
                            getCertificate: function (emeOptions, callback) {
                                console.log('get certificate')
                                videojs.xhr({
                                    url: fairplayCertUri,
                                    method: 'GET',
                                }, function (err, response, responseBody) {
                                    if (err) {
                                        callback(err)
                                        return
                                    }
                                    callback(null, base64DecodeUint8Array(responseBody));
                                })
                            },
                            getContentId: function (emeOptions, initData) {
                                const contentId = arrayToString(initData);
                                return contentId.substring(contentId.indexOf('skd://') + 6);
                            },
                            getLicense: function (emeOptions, contentId, keyMessage, callback) {
                                videojs.xhr({
                                    url: licenseUri,
                                    method: 'POST',
                                    responseType: 'text',
                                    body: 'spc=' + base64EncodeUint8Array(keyMessage),
                                    headers: {
                                        'Content-type': 'application/x-www-form-urlencoded',
                                        'pallycon-customdata-v2': fairplayToken
                                    }
                                }, function (err, response, responseBody) {
                                    if (err) {
                                        callback(err)
                                        return
                                    }
                                    callback(null, base64DecodeUint8Array(responseBody))
                                })
                            }
                        }
                    }
                };
            } 
            
         else {
                console.log("No DRM supported in this browser");
            }
            player.src(playerConfig);
        });
    }
    

  

    return (
        <div>
            <h1>PallyCon - VideoJS Sample</h1>
            <video
            id="my-player"
            ref={videoNode}
                className="video-js vjs-default-skin vjs-16-9"
                controls
                data-setup="{}"
            />
        </div>
    );
};

export default VideoPlayer;
