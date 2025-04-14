const enhancedTutorialSteps = [
  {
    id: 'welcome',
    title: "Welcome to PLAY MAKER!",
    content: "This tutorial will guide you through creating your first game. We'll walk through the entire process step by step.",
    position: { top: '40%', left: '50%' },
    additionalContent: "Keyboard Shortcuts:\n" +
      "→ or Space: Next step\n" +
      "←: Previous step\n" +
      "ESC: Skip tutorial",
  },
  {
    id: 'asset-panel',
    title: "Asset Panel",
    content: "First, let's add a character to your game. The Asset Panel on the left contains game objects you can use. Click and drag an asset to the canvas.",
    selector: ".asset-item",
    position: { top: '35%', left: '25%' },
    additionalContent:
      "Try dragging Mario to the canvas area.",
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
      "The canvas is where you build your game world.",
    autoAdvance: {
      selector: 'window',
      event: 'playmaker:assetAdded',
      delay: 100
    }
  },
  {
    id: 'select-asset',
    title: "Select Your Asset",
    content: "Now click on your character on the canvas to select it. This allows you to add behaviors and actions to make it interactive.",
    selector: ".canvas-container",
    position: { top: '50%', left: '20%' },      
    additionalContent: 
      "Selected assets are highlighted with a teal border.",
    autoAdvance: {
      selector: '.action-trigger-button',
      delay: 500
    }
  },
  {
    id: 'adding-actions',
    title: "Adding Actions",
    content: "Now that your asset is selected, the Actions panel has appeared. Click on the 'Press Space' trigger to define when an action should happen.",
    selector: ".action-trigger-button:nth-child(4)",
    position: { top: '40%', left: '35%' },
    additionalContent: 
      "Triggers are events that activate behaviors:\n" +
      "• Mouse Down: When player clicks on the asset\n" +
      "• On Start: When the game begins\n" +
      "• Press Up Arrow: When player presses the up arrow key\n" +
      "• Press Space: When player presses the space bar",
    autoAdvance: {
      selector: '.action-trigger-button:nth-child(4)',
      event: 'click',
      delay: 500
    }
  },
  {
    id: 'choosing-behavior',
    title: "Choosing Behavior",
    content: "Now select a behavior that will happen when the trigger is activated. For example, select 'Jump' to make your character jump when the space bar is pressed.",
    selector: ".action-behavior-button",
    position: { top: '40%', left: '55%' },
    additionalContent: 
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
    position: { top: '50%', left: '85%' },
    additionalContent: 
      "While in play mode:\n" +
      "• Press the space bar to trigger the action you just created\n" +
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