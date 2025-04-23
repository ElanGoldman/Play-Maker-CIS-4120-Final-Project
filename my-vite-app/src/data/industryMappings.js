export const industryMappings = {
    'mouseDown_jump': {
      engine: 'Unity',
      title: "Making an Object Jump on Mouse Click",
      description: "In Unity, you'd write code that constantly checks if the player clicks the mouse (usually the left button). When a click happens, you tell the object's physics component (called a 'Rigidbody') to add an upward force, making it jump.",
      keywords: ["Mouse Click", "Input", "Rigidbody", "AddForce", "Jump", "Update loop"],
      link: "https://docs.unity3d.com/ScriptReference/Input.GetMouseButtonDown.html"
    },
    'mouseDown_changeSize': {
      engine: 'Unity',
      title: "Changing Object Size on Mouse Click",
      description: "Similar to jumping, you'd check for a mouse click in your code. When the click occurs, you would directly change the object's 'scale' property to make it bigger or smaller.",
      keywords: ["Mouse Click", "Input", "Scale", "Transform", "Update loop"],
      link: "https://docs.unity3d.com/ScriptReference/Transform-localScale.html"
    },
    'mouseDown_setVector': {
        engine: 'Unity',
        title: "Pushing an Object on Mouse Click",
        description: "After detecting a mouse click in your code, you can give the object a push. This is usually done by telling its physics component ('Rigidbody') to add a force in a specific direction.",
        keywords: ["Mouse Click", "Input", "Rigidbody", "AddForce", "Vector", "Push", "Update loop"],
        link: "https://docs.unity3d.com/ScriptReference/Rigidbody.AddForce.html"
      },
    'onStart_move': {
      engine: 'Unity',
      title: "Making an Object Move Automatically",
      description: "To make an object move on its own when the game starts, you'd typically give it instructions in a special 'Start' or 'Awake' function in your code. Then, you might continuously tell its physics component ('Rigidbody') to apply force or maintain a certain speed in another function that runs every physics step ('FixedUpdate').",
      keywords: ["Start", "Awake", "FixedUpdate", "Rigidbody", "Velocity", "AddForce", "Continuous Movement"],
      link: "https://docs.unity3d.com/ScriptReference/Rigidbody.AddForce.html"
    },
     'onStart_setPosition': {
       engine: 'Unity',
       title: "Placing an Object at the Start",
       description: "When the game begins, you can place an object exactly where you want it using code. In a 'Start' or 'Awake' function, you simply set the object's 'position' property to the desired coordinates (X, Y, Z).",
       keywords: ["Start", "Awake", "Position", "Transform", "Coordinates", "Vector3"],
       link: "https://docs.unity3d.com/ScriptReference/Transform-position.html"
     },
    'keyPress_moveUp': {
      engine: 'Unity',
      title: "Moving an Object Up with a Key",
      description: "To move an object when a key (like the Up Arrow) is held down, your code needs to check constantly (usually in an 'Update' function) if that specific key is being pressed. If it is, you update the object's position to move it upwards.",
      keywords: ["Key Press", "Input", "Move", "Transform", "Translate", "Update loop"],
      link: "https://docs.unity3d.com/ScriptReference/Input.GetKey.html",
      codeSnippet: `
  public float moveSpeed = 5f;
  
  void Update()
  {
      // Check if the Up Arrow key is held down
      if (Input.GetKey(KeyCode.UpArrow))
      {
          // Move the object upward
          transform.Translate(Vector3.up * moveSpeed * Time.deltaTime);
      }
  }`
    },
    'spacePress_jump': {
      engine: 'Unity',
      title: "Making an Object Jump with Spacebar",
      description: "Similar to clicking, your code would check in its 'Update' loop if the player just pressed the Spacebar. If they did, you tell the object's physics component ('Rigidbody') to add a sudden upward force (an 'impulse'), causing it to jump.",
      keywords: ["Key Press", "Spacebar", "Input", "Rigidbody", "AddForce", "Impulse", "Jump", "Update loop"],
      link: "https://docs.unity3d.com/ScriptReference/Input.GetKeyDown.html"
    }
  };
  
  export const getIndustryInfo = (triggerType, behaviorId) => {
    const key = `${triggerType}_${behaviorId}`;
    return industryMappings[key] || null;
  };