const tutorialSteps = [
    {
      id: 'welcome',
      title: "Welcome to PLAY MAKER!",
      content: "This tutorial will guide you through creating your first game. Let's start by adding an asset to the canvas.",
      position: { top: '40%', left: '50%' },
    },
    {
      id: 'asset-panel',
      title: "Asset Panel",
      content: "Choose a character or object from the asset panel and drag it to the canvas.",
      selector: ".asset-item",
      position: { top: '30%', left: '20%' },
      autoAdvance: {
        selector: '.asset-item',
        event: 'dragstart',
        delay: 300
      }
    },
    {
      id: 'canvas',
      title: "Canvas",
      content: "Drop your asset anywhere on the canvas. This will be your game character.",
      selector: "canvas",
      position: { top: '40%', left: '50%' },
      autoAdvance: {
        // Using a condition function to check if assets have been added to canvas
        condition: () => document.querySelectorAll('.canvas-container img').length > 0,
        delay: 500
      }
    },
    {
      id: 'select-asset',
      title: "Select Your Asset",
      content: "Click on your asset on the canvas to select it and add actions.",
      selector: ".canvas-container",
      position: { top: '50%', left: '50%' },
      autoAdvance: {
        // Advance when the action panel appears (indicating an asset was selected)
        selector: '.action-trigger-button',
        delay: 500
      }
    },
    {
      id: 'adding-actions',
      title: "Adding Actions",
      content: "Click on a trigger like 'Mouse Down' to add an action to your asset.",
      selector: ".action-trigger-button",
      position: { top: '40%', left: '20%' },
      autoAdvance: {
        selector: '.action-trigger-button',
        event: 'click',
        delay: 500
      }
    },
    {
      id: 'choosing-behavior',
      title: "Choosing Behavior",
      content: "Select a behavior like 'Jump' to determine what happens when the trigger occurs.",
      selector: ".action-behavior-button",
      position: { top: '40%', left: '20%' },
      autoAdvance: {
        selector: '.action-behavior-button',
        event: 'click',
        delay: 500
      }
    },
    {
      id: 'test-game',
      title: "Test Your Game",
      content: "Press the play button to test how your game works!",
      selector: ".play-button",
      position: { top: '30%', left: '70%' },
      autoAdvance: {
        selector: '.play-button',
        event: 'click',
        delay: 500
      }
    },
    {
      id: 'congratulations',
      title: "Congratulations!",
      content: "You've created your first interactive game element! Keep adding more assets and actions to build your complete game.",
      position: { top: '50%', left: '50%' },
    }
  ];
  
  export default tutorialSteps;