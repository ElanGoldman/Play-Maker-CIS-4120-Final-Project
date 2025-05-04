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
  'mouseDown_teleport': {
    engine: 'Unity',
    title: "Teleporting Objects to Mouse Position",
    description: "This function instantly moves the object to the position where the user clicks the mouse. In Unity, you'd use Input.GetMouseButtonDown to detect clicks, then convert mouse screen position to world position using Camera.ScreenToWorldPoint, and finally set the object's transform.position to that location.",
    keywords: ["Mouse Click", "Input", "Transform", "Position", "Teleport", "ScreenToWorldPoint"],
    link: "https://docs.unity3d.com/ScriptReference/Camera.ScreenToWorldPoint.html",
    codeSnippet: `
    void Update()
    {
        // Check if the mouse button was pressed
        if (Input.GetMouseButtonDown(0))
        {
            // Get mouse position in screen space
            Vector3 mousePos = Input.mousePosition;
            
            // Convert to world position
            mousePos.z = Camera.main.nearClipPlane;
            Vector3 worldPosition = Camera.main.ScreenToWorldPoint(mousePos);
            
            // Set the object's position (keeping its Z position)
            transform.position = new Vector3(worldPosition.x, worldPosition.y, transform.position.z);
        }
    }`
  },
  'mouseDown_jump': {
    engine: 'Unity',
    title: "Making Objects Jump on Any Mouse Click",
    description: "In Unity, you'd write code that constantly checks if the player clicks anywhere in the game window (not just on specific objects). When a click happens, you tell the object's physics component (called a 'Rigidbody') to add an upward force, making it jump.",
    keywords: ["Mouse Click", "Input", "Rigidbody", "AddForce", "Jump", "Update loop"],
    link: "https://docs.unity3d.com/ScriptReference/Input.GetMouseButtonDown.html"
  },
  'onStart_fadeIn': {
    engine: 'Unity',
    title: "Fading In an Object When Game Starts",
    description: "This effect gradually makes an object appear by increasing its opacity from 0 (invisible) to 1 (fully visible). In Unity, you would use the CanvasGroup component or modify the alpha channel of the material/sprite renderer in the Start() function with a coroutine that gradually changes the transparency over time.",
    keywords: ["Start", "Awake", "Coroutine", "Lerp", "Alpha", "Transparency", "CanvasGroup", "Fade"],
    link: "https://docs.unity3d.com/ScriptReference/CanvasGroup-alpha.html",
    codeSnippet: `
    using UnityEngine;
    using System.Collections;

    public class FadeInEffect : MonoBehaviour
    {
        public float fadeDuration = 1.0f;
        
        void Start()
        {
            // Start invisible
            SetAlpha(0);
            
            // Begin fade-in effect
            StartCoroutine(FadeIn());
        }
        
        IEnumerator FadeIn()
        {
            float startTime = Time.time;
            
            while (Time.time < startTime + fadeDuration)
            {
                float t = (Time.time - startTime) / fadeDuration;
                SetAlpha(t);
                yield return null;
            }
            
            // Ensure we end at full opacity
            SetAlpha(1);
        }
        
        void SetAlpha(float alpha)
        {
            // For a Sprite Renderer
            SpriteRenderer renderer = GetComponent<SpriteRenderer>();
            if (renderer != null)
            {
                Color color = renderer.color;
                color.a = alpha;
                renderer.color = color;
            }
            
            // For a Canvas Group
            CanvasGroup canvasGroup = GetComponent<CanvasGroup>();
            if (canvasGroup != null)
            {
                canvasGroup.alpha = alpha;
            }
        }
    }`
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
  },
  'onStart_enableCollision': {
    engine: 'Unity',
    title: "Enable Collision Detection at Game Start",
    description: "This action adds a rigid body and collider to a game object when the game starts, allowing it to participate in Unity's built-in physics and collision detection system. Objects with collision enabled will automatically interact with other colliders in the scene.",
    keywords: ["Rigidbody", "Collider", "Physics", "Start", "Awake", "Collision Detection"],
    link: "https://docs.unity3d.com/ScriptReference/Rigidbody.html",
    codeSnippet: `
    void Start()
    {
        // Make sure we have a collider component
        if (GetComponent<Collider>() == null)
        {
            // Add a box collider that matches this object's size
            BoxCollider collider = gameObject.AddComponent<BoxCollider>();
            collider.size = GetComponent<Renderer>().bounds.size;
        }
        
        // Make sure we have a rigidbody for physics
        if (GetComponent<Rigidbody>() == null)
        {
            Rigidbody rb = gameObject.AddComponent<Rigidbody>();
            // Configure the rigidbody as needed
            rb.useGravity = true;
            rb.isKinematic = false;
        }
    }`
  },
  'onStart_winCollision': {
    engine: 'Unity',
    title: "Win Condition Collision Detector",
    description: "This adds a special collision detector to an object that triggers a win condition when it collides with another object that has collision enabled. In Unity, you would use OnCollisionEnter to detect when objects touch, then trigger game-winning events like showing a victory screen.",
    keywords: ["Collider", "Victory", "OnCollisionEnter", "Win Condition", "Game State", "UI Display"],
    link: "https://docs.unity3d.com/ScriptReference/MonoBehaviour.OnCollisionEnter.html",
    codeSnippet: `
    using UnityEngine;
    using UnityEngine.UI;

    public class WinCollisionDetector : MonoBehaviour
    {
        public Text winText;
        private bool hasWon = false;
        
        void Start()
        {
            // Hide win text initially
            if (winText != null)
                winText.gameObject.SetActive(false);
            
            // Make sure we have a collider for collision detection
            if (GetComponent<Collider>() == null)
            {
                gameObject.AddComponent<BoxCollider>();
            }
        }
        
        void OnCollisionEnter(Collision collision) 
        {
            if (!hasWon) {
                hasWon = true;
                
                // Show win text
                if (winText != null) {
                    winText.gameObject.SetActive(true);
                    winText.text = "YOU WIN!";
                }
                
                // Could also trigger other win effects here:
                // - Play victory sound
                // - Trigger particle effects
                // - Load next level
                // - etc.
            }
        }
    }`
  }
};

export const getIndustryInfo = (triggerType, behaviorId) => {
  const key = `${triggerType}_${behaviorId}`;
  return industryMappings[key] || null;
};