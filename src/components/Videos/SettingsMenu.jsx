import React, { useEffect, useState, useRef, forwardRef } from 'react';
import BackArrowIcon from '../../assets/images/back-arrow-icon.svg';
import NextArrowIcon from '../../assets/images/next-arrow-icon.svg';
import PlayBackRateIcon from '../../assets/images/playback-rate-icon.svg';
import QualityIcon from '../../assets/images/quality-icon.svg';


const qualities = [144, 240, 360, 480, 720];
const SettingsMenu = ({ player, typeOfVideo }) => {
  const [qualityLevels, setQualityLevels] = useState([]);
  const [showQuality, setShowQuality] = useState(false);
  const [showSpeed, setShowSpeed] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState('Normal');
  const [selectedQuality, setSelectedQuality] = useState('Auto');
  const [firstTimePlaying, setFirstTimePlaying] = useState(true);

  useEffect(() => {
    console.log('typeOfVideo', typeOfVideo);
    if (typeOfVideo !== 'video/youtube') {
     
      const levels = player.qualityLevels();
      player.on('play', () => {
        if (firstTimePlaying) {
        console.log('first time playing', firstTimePlaying);
        
        setFirstTimePlaying(false);
        }
      });
      const handleAddQualityLevel = () => {
        const newLevels = [];
        for (let i = 0; i < levels.length; i++) {
          newLevels.push(levels[i]);
        }
        setQualityLevels(newLevels);
      };
      levels.on('addqualitylevel', handleAddQualityLevel);
      handleAddQualityLevel();
      return () => {
        levels.off('addqualitylevel', handleAddQualityLevel);
      };

      
    }
  }, [player, typeOfVideo]);



  const handleSpeedChange = (speed) => {
    player.playbackRate(speed);
    setPlaybackSpeed(`${speed}x`);
    setShowSpeed(false);
  };

  const handleQualityChange = (quality) => {
    const levels = player.qualityLevels();
    
    // levels[4].enabled = false;
    // levels[3].enabled = false;
    // levels[2].enabled = false;
    // levels[1].enabled = false;
    // levels[0].enabled = false;
    for (let i = 0; i < levels.length; i++) {
      console.log('levels[i].height', levels[i].height);  
      console.log('quality', quality);
      console.log('levels[i].height === quality', levels[i].enabled);
      if (levels[i].height === quality) {
        levels[i].enabled = true;
      }
      else{
        levels[i].enabled = false;
      }
    }
 
  };

  const preventHideControlBar = () => {
    player.userActive(true);
    player.controlBar.show();
  };

  const stopPropagation = (event) => {
    event.stopPropagation(); // Prevent the click event from propagating to the document
  };

  return (
    <div
      className="vjs-settings-menu"
      onMouseEnter={preventHideControlBar}
      onMouseLeave={preventHideControlBar}
      onClick={stopPropagation} // Prevent clicks inside the menu from closing it
    >
      {!showQuality && !showSpeed && (
        <div className="vjs-settings-menu-main">
          <div className="vjs-settings-menu-item" onClick={() => setShowSpeed(true)}>
            <span className="vjs-settings-menu-icon">
              <img src={PlayBackRateIcon} alt="Playback Rate Icon" />
              Playback speed
            </span>
            <span className="vjs-settings-menu-arrow">
              {playbackSpeed}
              <img src={BackArrowIcon} alt="Back Arrow Icon" />
            </span>
          </div>
          {typeOfVideo !== 'video/youtube' && (
            <div className="vjs-settings-menu-item" onClick={() => setShowQuality(true)}>
              <span className="vjs-settings-menu-icon">
                <img src={QualityIcon} alt="Quality Icon" />
                Quality
              </span>
              <span className="vjs-settings-menu-arrow">
                {selectedQuality}
                <img src={BackArrowIcon} alt="Back Arrow Icon" />
              </span>
            </div>
          )}
        </div>
      )}

      {showSpeed && (
        <div className="vjs-settings-menu-sub">
          <div className="vjs-settings-menu-item title" onClick={() => setShowSpeed(false)}>
            <span className="vjs-settings-menu-arrow">
              <img src={NextArrowIcon} alt="Next Arrow Icon" />
              Playback Speed
            </span>
          </div>
          {player.options_.playbackRates.map((rate) => (
            <div key={rate} className="vjs-settings-menu-item" onClick={() => handleSpeedChange(rate)}>
              {rate}x
            </div>
          ))}
        </div>
      )}

      {showQuality && typeOfVideo !== 'video/youtube' && (
        <div className="vjs-settings-menu-sub">
          <div className="vjs-settings-menu-item title" onClick={() => setShowQuality(false)}>
            <span className="vjs-settings-menu-arrow">
              <img src={NextArrowIcon} alt="Next Arrow Icon" />
              Quality
            </span>
          </div>
          {qualityLevels.length > 0 ? (
            qualityLevels.map((level, index) => (
              <div key={index} className="vjs-settings-menu-item" onClick={() =>{
                handleQualityChange(480)
                handleQualityChange(level.height)
               
                setSelectedQuality(`${level.height}p`);
                setShowQuality(false);
               
              }
              }  >
                {level.height}p
              </div>
            ))
          ) : (
            <div className="vjs-settings-menu-item">No quality levels available</div>
          )}
        </div>
      )}
    </div>
  );
};


export default SettingsMenu;
