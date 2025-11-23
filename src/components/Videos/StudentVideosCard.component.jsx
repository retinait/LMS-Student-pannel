import React, { useEffect, useState } from "react";
import {
  Modal,
  Image,
  Typography,
  Layout,
  Row,
  Col,
  Card,
  Progress,
} from "antd";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  CloseCircleFilled,
  PlayCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { bucket_url, bucket_url_old, vodUrl } from "../../constants/constString";
import {
  markContentAsComplete,
  getAccessToken,
  getDrmAuthToken,
} from "../../stateManager/reducers/studentAuthSlice";
import "./StudentVideosCard.component.style.css";
import PlayerSection from "./PlayerSection.component";
import Settings from "./settings";
import { get, set } from "js-cookie";
import { useRef } from "react";
import {
  checkSupportedDRM,
  DRM_TYPE,
  enTokenUri,
} from "./pallycon-sample-helper";

const { Content } = Layout;
const { Title } = Typography;

const StudentVideosCard = (props) => {
  const { YtId, data, courseId, subjectId } = props;
  const dispatch = useDispatch();
  const playerRef = useRef(null);

  //console.log("data", data);

  window.onbeforeunload = function (event) {
    if (event.target.activeElement.tagName.toLowerCase() === "body") {
      // The user clicked the browser's back button
      alert("Browser back button is clicked.");
    }
  };
  const courseCompletionData = useSelector(
    (state) => state.studentAuth.courseCompletionData
  );

  const cloudUrl = vodUrl;
  const url = data?.isVOD
    ? cloudUrl + data?.URL
    : `https://www.youtube.com/watch?v=${YtId}`;
  const thumbnail = data?.isVOD
    ? (data?.thumbnail?.startsWith('user') ? bucket_url_old : bucket_url) + data?.thumbnail
    : `http://i3.ytimg.com/vi/${YtId}/hqdefault.jpg`;

  const [modalVisibility, setModalVisibility] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(true);
  const [videoDuration, setVideoDuration] = useState(0);
  const [drmInfo, setDrmInfo] = useState(null);
  const [intervalID, setIntervalID] = useState(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [completionSubmitted, setCompletionSubmitted] = useState(false);
  const [shouldDisposePlayer, setShouldDisposePlayer] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const intervalTime = 9000;

  const getAccessTokenAsync = async () => {
    //console.log("modalVisibility", modalVisibility);
    const res = await dispatch(
      getAccessToken({
        key: data?.URL,
      })
    );

    //console.log("Access Token", res?.payload?.data?.accessToken);
    setAccessToken(res?.payload?.data?.accessToken);
  };

  const getWideviderToken = async () => {
    if (data?.isDrmEnabled === "1") {
      console.log("DRM ENABLED");
      const student = JSON.parse(localStorage.getItem("student"));
      const drmType = await checkSupportedDRM();
      const contentId = data?.URL.split("/")[1].split(".")[0];
      const payload = {
        userId: `student-${student.username}`,
        contentId: contentId,
        platform: drmType.toLowerCase(),
      };
      const res = await dispatch(getDrmAuthToken(payload));
      console.log("getWideviderToken res", res);
      //console.log('getWideviderToken res', res.data.widevineToken);
      let encryptionToken = "";
      if (drmType === DRM_TYPE.WIDEVINE) {
        //setEncryptionToken(res.data.widevineToken);
        encryptionToken = res.payload.data.widevineToken;
      } else if (drmType === DRM_TYPE.FAIRPLAY) {
        //setEncryptionToken(res.data.fairplayToken);
        encryptionToken = res.payload.data.fairplayToken;
      } else if (drmType === DRM_TYPE.PLAYREADY) {
        //setEncryptionToken(res.data.playreadyToken);
        encryptionToken = res.payload.data.playReadyToken;
      }
      setDrmInfo({
        drmType: drmType,
        encryptionToken: encryptionToken,
        drmVersion: data.isDrmEnabled,
      });
    } else if (data?.isDrmEnabled === "0") {
      setDrmInfo({
        drmType: "",
        encryptionToken: "",
        drmVersion: "0",
      });
    } else {
      setDrmInfo({
        drmType: "",
        encryptionToken: "",
        drmVersion: "0",
      });
    }
    getAccessTokenAsync();
    const interval = setInterval(getAccessTokenAsync, intervalTime);
    console.log("getWideviderToken interval", interval);
    // if(localStorage.getItem('interval')){
    //   clearInterval(Number(localStorage.getItem('interval')));
      
    // }
    Settings.set("interval", interval);
    setIntervalID && setIntervalID(interval);
  };

  window.onpopstate = () => {
    Settings.set("modalVisibility", false);
    if (playerRef && playerRef.current) {
      playerRef.current?.dispose();
      playerRef.current = null;
    }
    //console.log('pop state', Settings.get('interval'));
    clearInterval(Number(Settings.get("interval")));
    setAccessToken(null);
  };

  //   console.log("Access Token", res?.payload?.data?.accessToken);
  //   setAccessToken(res?.payload?.data?.accessToken);

  useEffect(() => {
    if (!modalVisibility && playerRef && playerRef.current) {
      playerRef.current?.dispose();
      playerRef.current = null;
      setAccessToken(null);
      clearInterval(intervalID);
    }
    if (modalVisibility) {
      if (data?.isVOD && !accessToken) {
        //console.log("Getting Access Token");
        getWideviderToken();
      }
    }
    Settings.set("modalVisibility", modalVisibility);
    return () => {
      clearInterval(Number(Settings.get("interval")));
      setAccessToken(null);
      if (playerRef && playerRef.current) {
        playerRef.current?.dispose();
        playerRef.current = null;
      }
    };
  }, [modalVisibility]);

  useEffect(() => {
    courseCompletionData.map((item) => {
      if (data?.subjects?.includes(item?.subjectId)) {
        if (item?.video?.includes(data?._id)) {
          setVideoProgress(100);
        }
      }
    });
  }, [courseCompletionData]);

  // useEffect(() => {
  //   if (!modalVisibility && playerRef && playerRef.current) {
  //     playerRef.current?.dispose();
  //     playerRef.current = null;
  //     setAccessToken(null);
  //     clearInterval(intervalID);
  //   }
  //   if (modalVisibility) {
  //     if (data?.isVOD && !accessToken) {
  //       console.log("Getting Access Token");
  //       getAccessTokenAsync();
  //       const interval = setInterval(getAccessTokenAsync, intervalTime);
  //       //if interval is already set in local storage, clear it first
  //       if(localStorage.getItem('interval')){
  //         clearInterval(Number(localStorage.getItem('interval')));
  //       }
  //       else{
  //           localStorage.setItem('interval', interval);
  //       }

  //       Settings.set("interval", interval);
  //       setIntervalID && setIntervalID(interval);
  //     }
  //   }
  //   Settings.set("modalVisibility", modalVisibility);
  //   return () => {
  //     clearInterval(Number(Settings.get("interval")));
  //     setAccessToken(null);
  //     if (playerRef && playerRef.current) {
  //       playerRef.current?.dispose();
  //       playerRef.current = null;
  //     }
  //   };
  // }, [modalVisibility]);

  useEffect(() => {
    document.addEventListener("contextmenu", (event) => event.preventDefault());

    if (shouldDisposePlayer) {
      handleCancel();
    }
  }, [shouldDisposePlayer]);

  const showModal = async () => {
    //console.log('show modal');
    setModalVisibility(true);
    setVideoPlaying(true);
  };

  const handleCancel = () => {
    //console.log('handle cancel');
    setVideoPlaying(false);
    setModalVisibility(false);
  };

  return (
    <div className="student-video-card-wrap">
      <Card className="student-video-card" onClick={showModal} hoverable>
        <Content>
          <Row align="bottom">
            <Col xs={24} md={24}>
              <div className="video-item-wrap">
                <img
                  preview={false}
                  width="100%"
                  src={thumbnail}
                  placeholder={
                    <LoadingOutlined style={{ fontSize: 40, color: "#fff" }} />
                  }
                  style={{ objectFit: "cover", aspectRatio: "16/9" }}
                />
                <PlayCircleOutlined
                  className="play-icon"
                  style={{ fontSize: 64, color: "#ccc" }}
                />
              </div>
            </Col>
            <Col xs={24} md={24}>
              <Content style={{ padding: 15 }}>
                <Title
                  level={5}
                  style={{
                    fontWeight: 800,
                    paddingBottom: 0,
                    overflow: "hidden",
                  }}
                >
                  {data?.title || "NOt given"}
                </Title>
                <Progress
                  strokeColor={{ from: "#87d068", to: "#87d068" }}
                  percent={videoProgress}
                  format={(percent) => `${percent}%`}
                />
              </Content>
            </Col>
          </Row>
        </Content>
      </Card>
      <Content>
        <Row>
          <Modal
            className="video-player-modal"
            open={modalVisibility}
            onCancel={() => {
              clearInterval(intervalID);
              setVideoPlaying(false);
              setModalVisibility(false);
              //console.log('cancel');
            }}
            destroyOnClose={true}
            footer={null}
            maskClosable={false}
            maskStyle={{ background: "#000" }}
            closeIcon={
              <CloseCircleFilled style={{ color: "#fff", fontSize: "1.8em" }} />
            }
            closable={true}
            centered
            width={!!YtId ? "100%" : "300px"}
          >
            {
              <PlayerSection
                isVod={data?.isVOD}
                open={modalVisibility}
                sourceURL={url}
                sourceKey={data?.URL}
                intervalID={intervalID}
                playerRef={playerRef}
                accessToken={accessToken}
                drmInfo={drmInfo}
                onProgress={async (progress) => {
                  setVideoProgress(progress);
                  if (progress >= 80 && !completionSubmitted) {
                    const payload = { courseId, subjectId, type: "video" };
                    await dispatch(
                      markContentAsComplete({
                        contentId: data?._id,
                        data: payload,
                      })
                    );
                    setCompletionSubmitted(true);
                  }
                }}
                onEnded={async () => {
                  const payload = { courseId, subjectId, type: "video" };
                  await dispatch(
                    markContentAsComplete({
                      contentId: data?._id,
                      data: payload,
                    })
                  );
                }}
              />
              // <VideoPlayer
              // hlsUri={url}
              // fairplayToken={widevineToken}
              //  />
            }
          </Modal>
        </Row>
      </Content>
    </div>
  );
};

export default StudentVideosCard;
