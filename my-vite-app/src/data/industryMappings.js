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
    link: "https://docs.unity3d.com/ScriptReference/Input.GetMouseButtonDown.html",
    codeSnippet: `
    void Update()
    {
        // Check if the mouse button was pressed
        if (Input.GetMouseButtonDown(0))
        {
            // Add upward force to make the object jump
            GetComponent<Rigidbody>().AddForce(Vector3.up * jumpForce, ForceMode.Impulse);
        }
    }`
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
  'keyPressDown_setVector': {
    engine: 'Unity',
    title: "Moving an Object Downward with Down Arrow Key",
    description: "This behavior creates downward movement when the player presses the Down Arrow key. In Unity, this is implemented by checking for key presses in the Update method and modifying the object's position or velocity whenever the key is held down.",
    keywords: ["Input", "GetKey", "Vector3", "Translate", "Vertical Movement", "Down Arrow"],
    link: "https://docs.unity3d.com/ScriptReference/Input.GetKey.html",
    codeSnippet: `
    public float moveSpeed = 5f;

    void Update()
    {
        // Check if the Down Arrow key is being held down
        if (Input.GetKey(KeyCode.DownArrow))
        {
            // Move the object downward
            transform.Translate(Vector3.down * moveSpeed * Time.deltaTime);
            
            // Or with rigidbody:
            // GetComponent<Rigidbody>().velocity = new Vector3(0, -moveSpeed, 0);
        }
    }`
  },
  'keyPressLeft_setVector': {
    engine: 'Unity',
    title: "Moving an Object Left with Left Arrow Key",
    description: "This action moves the object to the left when the player presses the Left Arrow key. In Unity, this works by monitoring the Input system during each Update cycle and translating the object's position or applying a velocity to its Rigidbody component.",
    keywords: ["Input", "GetKey", "Horizontal Movement", "Transform", "Left Arrow", "Vector3"],
    link: "https://docs.unity3d.com/ScriptReference/Input.GetKey.html",
    codeSnippet: `
    public float moveSpeed = 5f;

    void Update()
    {
        // Check if the Left Arrow key is being held down
        if (Input.GetKey(KeyCode.LeftArrow))
        {
            // Move the object left
            transform.Translate(Vector3.left * moveSpeed * Time.deltaTime);
            
            // Or with rigidbody:
            // GetComponent<Rigidbody>().velocity = new Vector3(-moveSpeed, 0, 0);
        }
    }`
  },
  'keyPressRight_setVector': {
    engine: 'Unity',
    title: "Moving an Object Right with Right Arrow Key",
    description: "This behavior allows an object to move right when the Right Arrow key is pressed. In Unity games, this is implemented by constantly checking for key input in the Update method and moving the object's transform or applying velocity to its Rigidbody whenever the key is held.",
    keywords: ["Input", "GetKey", "Horizontal Movement", "Rigidbody", "Right Arrow", "Velocity"],
    link: "https://docs.unity3d.com/ScriptReference/Input.GetKey.html",
    codeSnippet: `
    public float moveSpeed = 5f;

    void Update()
    {
        // Check if the Right Arrow key is being held down
        if (Input.GetKey(KeyCode.RightArrow))
        {
            // Move the object right
            transform.Translate(Vector3.right * moveSpeed * Time.deltaTime);
            
            // Or with rigidbody:
            // GetComponent<Rigidbody>().velocity = new Vector3(moveSpeed, 0, 0);
        }
    }`
  },
  'spacePress_jump': {
    engine: 'Unity',
    title: "Making an Object Jump with Spacebar",
    description: "Similar to clicking, your code would check in its 'Update' loop if the player just pressed the Spacebar. If they did, you tell the object's physics component ('Rigidbody') to add a sudden upward force (an 'impulse'), causing it to jump.",
    keywords: ["Key Press", "Spacebar", "Input", "Rigidbody", "AddForce", "Impulse", "Jump", "Update loop"],
    link: "https://docs.unity3d.com/ScriptReference/Input.GetKeyDown.html",
    codeSnippet: `
    public float jumpForce = 5f;
    private bool isGrounded = true;

    void Update()
    {
        // Check if Spacebar was just pressed and the object is on the ground
        if (Input.GetKeyDown(KeyCode.Space) && isGrounded)
        {
            // Add upward force to make the object jump
            GetComponent<Rigidbody>().AddForce(Vector3.up * jumpForce, ForceMode.Impulse);
            isGrounded = false;
        }
    }

    // This would be called when the object collides with the ground
    void OnCollisionEnter(Collision collision)
    {
        if (collision.gameObject.CompareTag("Ground"))
        {
            isGrounded = true;
        }
    }`
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
  },
  'keyPress_setVector': {
    engine: 'Unity',
    title: "Moving an Object Upward with Up Arrow Key",
    description: "This behavior makes the object move upward continuously while the Up Arrow key is held down. In Unity, this is achieved by checking the Input system during each Update cycle and applying a velocity vector to the object's Rigidbody or changing its Transform position.",
    keywords: ["Input", "GetKey", "Up Arrow", "Vector3", "Movement", "Vertical Motion"],
    link: "https://docs.unity3d.com/ScriptReference/Input.GetKey.html",
    codeSnippet: `
    public float moveSpeed = 5f;

    void Update()
    {
        // Check if the Up Arrow key is being held down
        if (Input.GetKey(KeyCode.UpArrow))
        {
            // Move the object upward
            transform.Translate(Vector3.up * moveSpeed * Time.deltaTime);
            
            // Or with rigidbody:
            // GetComponent<Rigidbody>().velocity = new Vector3(0, moveSpeed, 0);
        }
    }`
  },
  'mouseDown_setVector': {
    engine: 'Unity',
    title: "Moving Objects Based on Mouse Clicks",
    description: "This behavior applies a constant velocity to an object whenever the player clicks anywhere on the screen. In Unity, this would be implemented using Input.GetMouseButtonDown to detect mouse clicks and then applying a velocity vector to the selected object's Rigidbody component.",
    keywords: ["Input", "GetMouseButtonDown", "Rigidbody", "Velocity", "Vector", "Movement"],
    link: "https://docs.unity3d.com/ScriptReference/Input.GetMouseButtonDown.html",
    codeSnippet: `
    public Vector3 moveVector = new Vector3(5, 0, 0); // Move right by default

    void Update()
    {
        // Check if any mouse button was pressed
        if (Input.GetMouseButtonDown(0)) // 0 is left mouse button
        {
            // Apply the velocity vector
            Rigidbody rb = GetComponent<Rigidbody>();
            if (rb)
            {
                rb.velocity = moveVector;
            }
            else
            {
                // If no Rigidbody, use transform directly
                transform.Translate(moveVector * Time.deltaTime);
            }
        }
    }`
  },
  'onStart_setVector': {
    engine: 'Unity',
    title: "Setting Initial Velocity When Game Starts",
    description: "This behavior gives an object a constant velocity as soon as the game begins. In Unity, this is implemented in the Start() method by setting the velocity property of the object's Rigidbody component, causing immediate and continuous movement in the specified direction.",
    keywords: ["Start", "Rigidbody", "Velocity", "Initial Movement", "Physics"],
    link: "https://docs.unity3d.com/ScriptReference/Rigidbody-velocity.html",
    codeSnippet: `
    public Vector3 initialVelocity = new Vector3(5, 0, 0); // Move right at 5 units per second

    void Start()
    {
        // Make sure we have a rigidbody
        Rigidbody rb = GetComponent<Rigidbody>();
        if (rb == null)
        {
            rb = gameObject.AddComponent<Rigidbody>();
        }
        
        // Set the initial velocity
        rb.velocity = initialVelocity;
    }`
  },
  'onClick_teleport': {
    engine: 'Unity',
    title: "Teleporting an Object When Clicked",
    description: "This behavior instantly moves an object to a predetermined position when the player clicks on it. In Unity, this would use the OnMouseDown event and then change the object's transform.position value to the target coordinates.",
    keywords: ["OnMouseDown", "Transform", "Position", "Teleport", "Click Response"],
    link: "https://docs.unity3d.com/ScriptReference/MonoBehaviour.OnMouseDown.html",
    codeSnippet: `
    public Vector3 teleportDestination = new Vector3(0, 5, 0); // Target position

    void OnMouseDown()
    {
        // Instantly move to the target position
        transform.position = teleportDestination;
        
        // Optional: Add visual effect
        // Instantiate(teleportEffectPrefab, transform.position, Quaternion.identity);
    }`
  },
  'spacePress_teleport': {
    engine: 'Unity', 
    title: "Teleporting an Object With Spacebar",
    description: "This action instantly moves the object to a predefined location whenever the player presses the Spacebar. In Unity, this would be implemented by checking for key presses in the Update method and changing the object's transform.position when the key is detected.",
    keywords: ["Input", "GetKeyDown", "Space", "Transform", "Position", "Teleport"],
    link: "https://docs.unity3d.com/ScriptReference/Input.GetKeyDown.html",
    codeSnippet: `
    public Vector3 teleportDestination = new Vector3(0, 5, 0); // Target position

    void Update()
    {
        // Check if Spacebar was just pressed
        if (Input.GetKeyDown(KeyCode.Space))
        {
            // Save original position for effects if needed
            Vector3 originalPosition = transform.position;
            
            // Instantly move to the target position
            transform.position = teleportDestination;
            
            // Optional: Add visual effects
            // Instantiate(teleportEffectPrefab, originalPosition, Quaternion.identity);
            // Instantiate(teleportEffectPrefab, teleportDestination, Quaternion.identity);
        }
    }`
  },
  'spacePress_setVector': {
    engine: 'Unity',
    title: "Setting Object Velocity With Spacebar",
    description: "This behavior applies a constant velocity to an object whenever the player presses the Spacebar. In game engines like Unity, this is handled by checking for key presses each frame and modifying the object's Rigidbody velocity when the key is detected.",
    keywords: ["Input", "GetKeyDown", "Space", "Rigidbody", "Velocity", "Movement"],
    link: "https://docs.unity3d.com/ScriptReference/Input.GetKeyDown.html",
    codeSnippet: `
    public Vector3 impulseVector = new Vector3(5, 0, 0); // Move right by default

    void Update()
    {
        // Check if Spacebar was just pressed
        if (Input.GetKeyDown(KeyCode.Space))
        {
            // Apply the velocity vector
            Rigidbody rb = GetComponent<Rigidbody>();
            if (rb)
            {
                rb.velocity = impulseVector;
            }
        }
    }`
  },
  'spacePress_changeSize': {
    engine: 'Unity',
    title: "Changing Object Size With Spacebar",
    description: "This behavior resizes an object when the Spacebar is pressed. In Unity, this would be implemented by modifying the object's transform.localScale property, effectively changing its displayed size without affecting its collision bounds unless explicitly updated.",
    keywords: ["Input", "GetKeyDown", "Space", "Transform", "Scale", "Resize"],
    link: "https://docs.unity3d.com/ScriptReference/Transform-localScale.html",
    codeSnippet: `
    public float scaleMultiplier = 1.5f; // How much to scale by
    private Vector3 originalScale;
    private bool isScaled = false;

    void Start()
    {
        // Store the original scale
        originalScale = transform.localScale;
    }

    void Update()
    {
        // Check if Spacebar was just pressed
        if (Input.GetKeyDown(KeyCode.Space))
        {
            if (!isScaled)
            {
                // Scale up
                transform.localScale = originalScale * scaleMultiplier;
                isScaled = true;
            }
            else
            {
                // Scale back to original
                transform.localScale = originalScale;
                isScaled = false;
            }
        }
    }`
  },
  'keyPressDown_jump': {
    engine: 'Unity',
    title: "Jumping Downward With Down Arrow Key",
    description: "This unusual behavior applies a downward force when the Down Arrow key is pressed, similar to a reverse jump. In Unity, this would use the Input system to detect key presses and apply a downward force to the object's Rigidbody component.",
    keywords: ["Input", "GetKeyDown", "Down Arrow", "Rigidbody", "AddForce", "Downward Jump"],
    link: "https://docs.unity3d.com/ScriptReference/Input.GetKeyDown.html",
    codeSnippet: `
    public float downwardForce = 5f;

    void Update()
    {
        // Check if the Down Arrow key was just pressed
        if (Input.GetKeyDown(KeyCode.DownArrow))
        {
            // Add downward force
            Rigidbody rb = GetComponent<Rigidbody>();
            if (rb)
            {
                rb.AddForce(Vector3.down * downwardForce, ForceMode.Impulse);
            }
        }
    }`
  },
  'keyPressLeft_jump': {
    engine: 'Unity',
    title: "Jumping Sideways With Left Arrow Key",
    description: "This behavior creates a sideways jumping motion to the left when the Left Arrow key is pressed. In Unity, this would be implemented by applying a force with both leftward and upward components to the object's Rigidbody when the key press is detected.",
    keywords: ["Input", "GetKeyDown", "Left Arrow", "Rigidbody", "AddForce", "Directional Jump"],
    link: "https://docs.unity3d.com/ScriptReference/Input.GetKeyDown.html",
    codeSnippet: `
    public float horizontalForce = 5f;
    public float upwardForce = 3f;
    private bool canJump = true;

    void Update()
    {
        // Check if the Left Arrow key was just pressed and we can jump
        if (Input.GetKeyDown(KeyCode.LeftArrow) && canJump)
        {
            // Add diagonal force (left and up)
            Rigidbody rb = GetComponent<Rigidbody>();
            if (rb)
            {
                Vector3 jumpForce = new Vector3(-horizontalForce, upwardForce, 0);
                rb.AddForce(jumpForce, ForceMode.Impulse);
                
                // Prevent jumping again until landing
                canJump = false;
                Invoke("ResetJump", 1.0f);
            }
        }
    }

    void ResetJump()
    {
        canJump = true;
    }`
  },
  'keyPressRight_jump': {
    engine: 'Unity',
    title: "Jumping Sideways With Right Arrow Key",
    description: "This behavior creates a sideways jumping motion to the right when the Right Arrow key is pressed. In Unity, this would be implemented by applying a force with both rightward and upward components to the object's Rigidbody when the key press is detected.",
    keywords: ["Input", "GetKeyDown", "Right Arrow", "Rigidbody", "AddForce", "Directional Jump"],
    link: "https://docs.unity3d.com/ScriptReference/Input.GetKeyDown.html",
    codeSnippet: `
    public float horizontalForce = 5f;
    public float upwardForce = 3f;
    private bool canJump = true;

    void Update()
    {
        // Check if the Right Arrow key was just pressed and we can jump
        if (Input.GetKeyDown(KeyCode.RightArrow) && canJump)
        {
            // Add diagonal force (right and up)
            Rigidbody rb = GetComponent<Rigidbody>();
            if (rb)
            {
                Vector3 jumpForce = new Vector3(horizontalForce, upwardForce, 0);
                rb.AddForce(jumpForce, ForceMode.Impulse);
                
                // Prevent jumping again until landing
                canJump = false;
                Invoke("ResetJump", 1.0f);
            }
        }
    }

    void ResetJump()
    {
        canJump = true;
    }`
  },
  'onStart_changeSize': {
    engine: 'Unity',
    title: "Changing Object Size When Game Starts",
    description: "This behavior automatically scales an object to a new size as soon as the game begins. In Unity, this would be implemented in the Start() method by modifying the object's transform.localScale property, which affects its visual appearance but not necessarily its collision size.",
    keywords: ["Start", "Transform", "Scale", "Resize", "Initial Setup"],
    link: "https://docs.unity3d.com/ScriptReference/Transform-localScale.html",
    codeSnippet: `
    public Vector3 targetScale = new Vector3(2, 2, 2); // Double the size

    void Start()
    {
        // Store original scale for reference if needed
        Vector3 originalScale = transform.localScale;
        
        // Set the new scale
        transform.localScale = targetScale;
        
        // Optional: Animate the scaling
        // StartCoroutine(ScaleOverTime(originalScale, targetScale, 1.0f));
    }

    // Optional coroutine for animated scaling
    IEnumerator ScaleOverTime(Vector3 startScale, Vector3 endScale, float duration)
    {
        float startTime = Time.time;
        float endTime = startTime + duration;
        
        while (Time.time < endTime)
        {
            float t = (Time.time - startTime) / duration;
            transform.localScale = Vector3.Lerp(startScale, endScale, t);
            yield return null;
        }
        
        transform.localScale = endScale; // Ensure we end at exactly the target scale
    }`
  }
};

export const getIndustryInfo = (triggerType, behaviorId) => {
  const key = `${triggerType}_${behaviorId}`;
  return industryMappings[key] || null;
};