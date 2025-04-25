export const industryMappings = {
  'onClick_jump': {
    engine: 'Unity',
    title: "Making an Object Jump When Clicked",
    description: "In Unity, you'd attach a script to your object that detects when a player clicks directly on it. When clicked, the script applies an upward force to the object's physics component (Rigidbody), causing it to jump.",
    keywords: ["OnMouseDown", "Collider", "Rigidbody", "AddForce", "Jump", "Click Detection"],
    link: "https://docs.unity3d.com/ScriptReference/MonoBehaviour.OnMouseDown.html"
  },
  'onClick_changeSize': {
    engine: 'Unity',
    title: "Changing Object Size When Clicked",
    description: "This approach uses Unity's built-in mouse detection. When the player clicks directly on the object, its scale is changed, making it larger or smaller. This requires the object to have a Collider component to detect the click properly.",
    keywords: ["OnMouseDown", "Collider", "Transform", "Scale", "Click Detection"],
    link: "https://docs.unity3d.com/ScriptReference/Transform-localScale.html"
  },
  'onClick_setVector': {
      engine: 'Unity',
      title: "Pushing an Object When Clicked",
      description: "When the player clicks directly on this object, it applies a force in a specific direction. The script uses Unity's OnMouseDown function, which requires a Collider component on the object, and applies the force through the Rigidbody component.",
      keywords: ["OnMouseDown", "Collider", "Rigidbody", "AddForce", "Vector", "Push"],
      link: "https://docs.unity3d.com/ScriptReference/Rigidbody.AddForce.html"
    },
  'mouseDown_jump': {
    engine: 'Unity',
    title: "Making Objects Jump on Any Mouse Click",
    description: "In Unity, you'd write code that constantly checks if the player clicks anywhere in the game window (not just on specific objects). When a click happens, you tell the object's physics component (called a 'Rigidbody') to add an upward force, making it jump.",
    keywords: ["Mouse Click", "Input", "Rigidbody", "AddForce", "Jump", "Update loop"],
    link: "https://docs.unity3d.com/ScriptReference/Input.GetMouseButtonDown.html"
  },
  'mouseDown_changeSize': {
    engine: 'Unity',
    title: "Changing Object Size on Any Mouse Click",
    description: "Similar to jumping, you'd check for a mouse click anywhere in the game window. When any click occurs, you would directly change the object's 'scale' property to make it bigger or smaller, regardless of whether the player clicked on the object itself.",
    keywords: ["Mouse Click", "Input", "Scale", "Transform", "Update loop"],
    link: "https://docs.unity3d.com/ScriptReference/Transform-localScale.html"
  },
  'mouseDown_setVector': {
      engine: 'Unity',
      title: "Pushing Objects on Any Mouse Click",
      description: "After detecting any mouse click in your game window, you can give objects a push. This is usually done by telling their physics component ('Rigidbody') to add a force in a specific direction. This happens regardless of where the player clicks.",
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
  'keyPress_jump': {
    engine: 'Unity',
    title: "Making an Object Jump with Up Arrow Key",
    description: "When the Up Arrow key is pressed, your code adds an upward force to the object's physics component (Rigidbody). This creates a jumping motion similar to platformer games. The code checks for the key press in every frame using the Update function.",
    keywords: ["Key Press", "Up Arrow", "Input", "Rigidbody", "AddForce", "Impulse", "Jump", "Update loop"],
    link: "https://docs.unity3d.com/ScriptReference/Input.GetKeyDown.html",
    codeSnippet: `
public float jumpForce = 5f;
private bool canJump = true;

void Update()
{
    // Check if the Up Arrow key was just pressed and can jump
    if (Input.GetKeyDown(KeyCode.UpArrow) && canJump)
    {
        // Add upward force to make the object jump
        GetComponent<Rigidbody>().AddForce(Vector3.up * jumpForce, ForceMode.Impulse);
        canJump = false;
        Invoke("ResetJump", 1.0f); // Allow jumping again after 1 second
    }
}

void ResetJump()
{
    canJump = true;
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