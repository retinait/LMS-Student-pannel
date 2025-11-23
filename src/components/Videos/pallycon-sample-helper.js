export var enTokenUri = "http://demo.bizinsight.io:8055/api/v1/drm/authorize";
export var licenseUri =
  "https://license-global.pallycon.com/ri/licenseManager.do";

// Replace the DEMO site ID with yours when you test your own FPS content.
export var fairplayCertUri =
  "https://license-global.pallycon.com/ri/fpsKeyManager.do?siteId=EILT"; // for base64 encoded binary cert data

export const DRM_TYPE = {
  WIDEVINE: "Widevine",
  PLAYREADY: "PlayReady",
  FAIRPLAY: "FairPlay",
};

// checks which DRM is supported by the browser
export async function checkSupportedDRM() {
  let drmType = "";
  const config = [
    {
      initDataTypes: ["cenc"],
      audioCapabilities: [
        {
          contentType: 'audio/mp4;codecs="mp4a.40.2"',
        },
      ],
      videoCapabilities: [
        {
          contentType: 'video/mp4;codecs="avc1.42E01E"',
        },
      ],
    },
  ];
  const drm = {
    PlayReady: {
      name: DRM_TYPE.PLAYREADY,
      mediaKey: "com.microsoft.playready",
    },
    Widevine: {
      name: DRM_TYPE.WIDEVINE,
      mediaKey: "com.widevine.alpha",
    },
    FairPlay: {
      name: DRM_TYPE.FAIRPLAY,
      mediaKey: "com.apple.fps.1_0",
    },
  };
  let supportedDRMType = "";
  for (const key in drm) {
    try {
      await navigator
        .requestMediaKeySystemAccess(drm[key].mediaKey, config)
        .then((mediaKeySystemAccess) => {
          supportedDRMType = drm[key].name;
          console.log(supportedDRMType + " support ok");
        })
        .catch((e) => {
          console.log(key + " :: " + e);
        });
    } catch (e) {
      console.log(e);
    }
    // if supports widevine and playready, then choose widevine

    if (supportedDRMType === DRM_TYPE.WIDEVINE) {
      drmType = supportedDRMType;
      console.log("Supported DRM Type: ", drmType);
      break;
    } else if (supportedDRMType === DRM_TYPE.PLAYREADY) {
      drmType = supportedDRMType;
      console.log("Supported DRM Type: ", drmType);
    } else if (supportedDRMType === DRM_TYPE.FAIRPLAY) {
      drmType = supportedDRMType;
      console.log("Supported DRM Type: ", drmType);
    }

    //drmType = supportedDRMType;
  }

  return drmType;
}

// export function configureDRM(srcUri, token) {
//   let playerConfig;
//   console.log("DRM Type: ", drmType);
//   console.log("Token: ", token);
//   console.log("Source URI: ", srcUri);

//   if ("FairPlay" === drmType) {
//     let m3u8Uri = srcUri.replace(".mpd", ".m3u8");
//     console.log("M3U8 URI: ", m3u8Uri);

//     playerConfig = {
//       src: m3u8Uri,
//       type: "application/x-mpegurl",
//       keySystems: {
//         "com.apple.fps.1_0": {
//           getCertificate: function (emeOptions, callback) {
//             console.log("getCertificate")
//             videojs.xhr(
//               {
//                 url: fairplayCertUri,
//                 method: "GET",
//               },
//               function (err, response, responseBody) {
//                 if (err) {
//                   callback(err);
//                   return;
//                 }
//                 callback(null, base64DecodeUint8Array(responseBody));
//               }
//             );
//           },
//           getContentId: function (emeOptions, initData) {
//             const contentId = arrayToString(initData);
//             return contentId.substring(contentId.indexOf("skd://") + 6);
//           },
//           getLicense: function (emeOptions, contentId, keyMessage, callback) {
//             videojs.xhr(
//               {
//                 url: licenseUri,
//                 method: "POST",
//                 responseType: "text",
//                 body: "spc=" + base64EncodeUint8Array(keyMessage),
//                 headers: {
//                   "Content-type": "application/x-www-form-urlencoded",
//                   "pallycon-customdata-v2": token,
//                 },
//               },
//               function (err, response, responseBody) {
//                 if (err) {
//                   callback(err);
//                   return;
//                 }
//                 callback(null, base64DecodeUint8Array(responseBody));
//               }
//             );
//           },
//           options: {
//             persistentState: 'required'
//         }

//         },
//       },
//     };
//   } else if ("PlayReady" === drmType) {
//     playerConfig = {
//       src: srcUri,
//       type: "application/dash+xml",
//       keySystems: {
//         "com.microsoft.playready": {
//           url: licenseUri,
//           licenseHeaders: {
//             "pallycon-customdata-v2": token,
//           },
//         },
//       },
//     };
//   } else if ("Widevine" === drmType) {
//     playerConfig = {
//       src: srcUri,
//       // type: 'application/x-mpegurl',
//       type: "application/dash+xml",
//       keySystems: {
//         "com.widevine.alpha": {
//           url: licenseUri,
//           licenseHeaders: {
//             "pallycon-customdata-v2": token,
//           },
//           // persistentState: "required",
//         },
//       },
//     };
//     console.log("Widevine is playing");
//   } else {
//     console.log("No DRM supported in this browser");
//   }

//   return playerConfig;
// }

export function arrayToString(array) {
  var uint16array = new Uint16Array(array.buffer);
  return String.fromCharCode.apply(null, uint16array);
}

export function arrayBufferToString(buffer) {
  var arr = new Uint8Array(buffer);
  var str = String.fromCharCode.apply(String, arr);
  // if(/[\u0080-\uffff]/.test(str)){
  //     throw new Error("this string seems to contain (still encoded) multibytes");
  // }
  return str;
}

export function base64DecodeUint8Array(input) {
  var raw = window.atob(input);
  var rawLength = raw.length;
  var array = new Uint8Array(new ArrayBuffer(rawLength));

  for (let i = 0; i < rawLength; i++) array[i] = raw.charCodeAt(i);

  return array;
}

export function base64EncodeUint8Array(input) {
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

// function configureDRM(player) {
//   player.ready(function () {
//       let playerConfig;
//       player.eme();
//       if ('FairPlay' === drmType) {
//           console.log("Playing fairplay")
//           const hls = hlsUri.replace(".mpd", ".m3u8");
//           console.log("hls", hls)
//           playerConfig = {
//               src: hls,
//               type: 'application/x-mpegurl',
//               keySystems: {
//                   'com.apple.fps.1_0': {
//                       getCertificate: function (emeOptions, callback) {
//                           console.log('get certificate')
//                           videojs.xhr({
//                               url: fairplayCertUri,
//                               method: 'GET',
//                           }, function (err, response, responseBody) {
//                               if (err) {
//                                   callback(err)
//                                   return
//                               }
//                               callback(null, base64DecodeUint8Array(responseBody));
//                           })
//                       },
//                       getContentId: function (emeOptions, initData) {
//                           const contentId = arrayToString(initData);
//                           return contentId.substring(contentId.indexOf('skd://') + 6);
//                       },
//                       getLicense: function (emeOptions, contentId, keyMessage, callback) {
//                           videojs.xhr({
//                               url: licenseUri,
//                               method: 'POST',
//                               responseType: 'text',
//                               body: 'spc=' + base64EncodeUint8Array(keyMessage),
//                               headers: {
//                                   'Content-type': 'application/x-www-form-urlencoded',
//                                   'pallycon-customdata-v2': fairplayToken
//                               }
//                           }, function (err, response, responseBody) {
//                               if (err) {
//                                   callback(err)
//                                   return
//                               }
//                               callback(null, base64DecodeUint8Array(responseBody))
//                           })
//                       }
//                   }
//               }
//           };
//       }

//    else {
//           console.log("No DRM supported in this browser");
//       }
//       player.src(playerConfig);
//   });
// }
