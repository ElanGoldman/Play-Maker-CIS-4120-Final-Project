const enhancedTutorialSteps = [
    {
      id: 'welcome',
      title: "Welcome to PLAY MAKER!",
      content: "This tutorial will guide you through creating your first game. We'll walk through the entire process step by step.",
      position: { top: '40%', left: '50%' },
      additionalContent: 
        "👓 Click the glasses icon to make the screen transparent when you need to interact with elements.\n\n" +
        "Keyboard Shortcuts:\n" +
        "→ or Space: Next step\n" +
        "←: Previous step\n" +
        "T: Toggle transparency\n" +
        "ESC: Skip tutorial",
    },
    {
      id: 'asset-panel',
      title: "Asset Panel",
      content: "First, let's add a character to your game. The Asset Panel on the left contains game objects you can use. Click and drag an asset to the canvas.",
      selector: ".asset-item",
      position: { top: '30%', left: '20%' },
      additionalContent:
        "Try dragging Mario or Luigi to the canvas area.",
      autoAdvance: {
        selector: '.asset-item',
        event: 'dragstart',
        delay: 300
      }
    },
    {
      id: 'canvas',
      title: "Canvas",
      content: "Great! Now drop your asset anywhere on the canvas. This will be your game character that players can interact with.",
      selector: "canvas",
      position: { top: '40%', left: '50%' },
      additionalContent:
        "Keep the overlay transparent to complete this step.\n\n" +
        "The canvas is where you build your game world.",
      autoAdvance: {
        condition: () => document.querySelectorAll('.canvas-container img').length > 0,
        delay: 500
      }
    },
    {
      id: 'select-asset',
      title: "Select Your Asset",
      content: "Now click on your character on the canvas to select it. This allows you to add behaviors and actions to make it interactive.",
      selector: ".canvas-container",
      position: { top: '50%', left: '50%' },
      additionalContent:
        "Remember to use the 👓 button if you need to interact with elements.\n\n" +
        "Selected assets are highlighted with a teal border.",
      autoAdvance: {
        selector: '.action-trigger-button',
        delay: 500
      }
    },
    {
      id: 'adding-actions',
      title: "Adding Actions",
      content: "Now that your asset is selected, the Actions panel has appeared. Click on a trigger like 'Mouse Down' to define when an action should happen.",
      selector: ".action-trigger-button",
      position: { top: '40%', left: '20%' },
      additionalContent:
        "Make sure to toggle transparency with the 👓 button to interact with the buttons.\n\n" +
        "Triggers are events that activate behaviors:\n" +
        "• Mouse Down: When player clicks on the asset\n" +
        "• On Start: When the game begins\n" +
        "• Press Up Arrow: When player presses the up arrow key\n" +
        "• Press Space: When player presses the space bar",
      autoAdvance: {
        selector: '.action-trigger-button',
        event: 'click',
        delay: 500
      }
    },
    {
      id: 'choosing-behavior',
      title: "Choosing Behavior",
      content: "Now select a behavior that will happen when the trigger is activated. For example, select 'Jump' to make your character jump when clicked.",
      selector: ".action-behavior-button",
      position: { top: '40%', left: '20%' },
      additionalContent:
        "Keep the overlay transparent to select a behavior.\n\n" +
        "Behaviors determine what happens when triggered:\n" +
        "• Jump: Makes the asset leap upward\n" +
        "• Move: Changes the asset's position\n" +
        "• Change Size: Scales the asset larger or smaller",
      autoAdvance: {
        selector: '.action-behavior-button',
        event: 'click',
        delay: 500
      }
    },
    {
      id: 'test-game',
      title: "Test Your Game",
      content: "Excellent! Now let's test your game. Press the play button in the top-right corner of the canvas to see your creation in action.",
      selector: ".play-button",
      position: { top: '30%', left: '70%' },
      additionalContent:
        "Toggle transparency with the 👓 button to press the play button.\n\n" +
        "While in play mode:\n" +
        "• Try clicking on your character to trigger the action\n" +
        "• Press the play button again to stop and return to editing",
      autoAdvance: {
        selector: '.play-button',
        event: 'click',
        delay: 500
      }
    },
    {
      id: 'congratulations',
      title: "Congratulations!",
      content: "You've created your first interactive game element! You can now add more assets and actions to build a complete game.",
      position: { top: '50%', left: '50%' },
      additionalContent:
        "What to try next:\n" +
        "• Add more characters with different behaviors\n" +
        "• Add objects that respond to keyboard controls\n" +
        "• Experiment with different triggers and actions\n" +
        "• Create a complete game scene with multiple interactive elements\n\n" +
        "Happy game making!",
    }
  ];
  
  export default enhancedTutorialSteps;