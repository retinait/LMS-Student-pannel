import videojs from 'video.js';
import React from 'react';
import ReactDOM from 'react-dom';
import SettingsMenu from './SettingsMenu';
import Settings from './settings';

const Button = videojs.getComponent('Button');

class CustomSettingsButton extends Button {
  constructor(player, options) {
    super(player, options);
    this.addClass('vjs-custom-settings-button');
    this.controlText('Settings');

    this.menuContainer = document.createElement('div');
    this.menuContainer.className = 'vjs-settings-menu-container';

   // console.log('options', options.playerOptions?.sources[0].type);
    ReactDOM.render(<SettingsMenu player={this.player()} typeOfVideo={options.playerOptions?.sources[0].type} />, this.menuContainer);
    this.player().el().appendChild(this.menuContainer);

    this.handleClick = this.handleClick.bind(this);
    this.handleDocumentClick = this.handleDocumentClick.bind(this);
    this.handlePlayerControlHide = this.handlePlayerControlHide.bind(this);

    // Hide the menu when the player controls hide
    this.player().on('userinactive', this.handlePlayerControlHide);
  }

  handleClick(event) {
    event.stopPropagation();
    if (this.menuContainer.style.display === 'block') {
      this.menuContainer.style.display = 'none';
      document.removeEventListener('click', this.handleDocumentClick);
      console.log('click hide');
      Settings.set('showSettings', false);
    } else {
      this.menuContainer.style.display = 'block';
      document.addEventListener('click', this.handleDocumentClick);
      this.player().userActive(true);
      this.player().controlBar.show();
      console.log('click show');
      Settings.set('showSettings', true);
    }

  
  }

  handleDocumentClick(event) {
    if (
      this.menuContainer &&
      !this?.menuContainer?.contains(event.target) &&
      !this?.el()?.contains(event.target)
    ) {
      this.menuContainer.style.display = 'none';
      document.removeEventListener('click', this.handleDocumentClick);
    }

    console.log('document click');
  }

  handlePlayerControlHide() {
    if (this.menuContainer?.style.display === 'block') {
      this.menuContainer.style.display = 'none';
      console.log('hide');
      document.removeEventListener('click', this.handleDocumentClick);
      //window.event.stopPropagation();
      //stop further click propagation

    }
    console.log('userinactive');
  }

  buildCSSClass() {
    return `vjs-custom-settings-button ${super.buildCSSClass()}`;
  }

  handleMouseDown(event) {
    this.handleClick(event);
  }

  handleMouseMove(event) {
    this.handleClick(event);
  }
}

videojs.registerComponent('CustomSettingsButton', CustomSettingsButton);

export default CustomSettingsButton;
