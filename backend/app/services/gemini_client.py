import os
import json
import requests
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Google Gemini API configuration
GEMINI_API_KEY = ""
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"


def call_gemini_api(messages, temperature=0.5, max_tokens=1024):
    """Call Google Gemini API with the given messages."""
    # Convert messages to Gemini format
    # Combine system and user messages into a single text prompt
    combined_text = ""
    for message in messages:
        if message["role"] == "system":
            combined_text += f"{message['content']}\n\n"
        elif message["role"] == "user":
            combined_text += f"{message['content']}\n\n"

    payload = {
        "contents": [{"parts": [{"text": combined_text}]}],
        "generationConfig": {
            "temperature": temperature,
            "maxOutputTokens": max_tokens,
        },
    }

    headers = {"Content-Type": "application/json"}

    try:
        response = requests.post(
            f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
            headers=headers,
            json=payload,
            timeout=30,
        )

        if response.status_code == 200:
            response_data = response.json()
            # Extract text from Gemini response format
            if "candidates" in response_data and len(response_data["candidates"]) > 0:
                candidate = response_data["candidates"][0]
                if "content" in candidate and "parts" in candidate["content"]:
                    text_response = candidate["content"]["parts"][0]["text"]
                    print(f"Gemini API Response: {text_response[:200]}...")
                    return text_response
            return "Error: Unexpected response format"
        else:
            print(f"API Error: {response.status_code} - {response.text}")
            return f"Error: API call failed with status {response.status_code}: {response.text}"
    except requests.exceptions.RequestException as e:
        print(f"Request Exception: {e}")
        return f"Error: Request failed - {str(e)}"


CATEGORY_PROMPTS = {
    # The Computer Science and Math prompts are already in the correct format from our last exchange.
    # Here are all the others, updated to match.
    "Computer Science & Technology": """
You are a world-class technical educator. Your job is to output a JSON object describing how to visually teach the following computer science concept.
The response must be a JSON object that strictly adheres to the following structure:
- title: A short title for the concept.
- layout: A brief description of the overall visual arrangement (e.g., "A horizontal array of boxes representing memory slots...").
- interaction: A description of the primary user interaction (e.g., "User clicks a 'Next Step' button to see the pointers move and values swap.").
- elements: A list of visual element objects. Each object must have:
  - label: The name or text on the element (e.g., "Array", "Pointer").
  - type: The kind of element (e.g., "box", "arrow", "text").
  - position: A descriptive position (e.g., "top-center", "dynamic").
  - description: A short explanation of the element's role.

Return only valid JSON. No markdown, no extra explanation.

Concept: "{concept}"
""",
    "Mathematics & Logic": """
You are a top-tier math educator. Your job is to output a JSON object describing how to visually teach the following math or logic concept.
The response must be a JSON object that strictly adheres to the following structure:
- title: Short name of the concept.
- layout: Description of the visual setup (e.g., "A Cartesian plane with X and Y axes...").
- interaction: How the user interacts with the visual (e.g., "User can drag a point on the line to see the equation update.").
- elements: A list of visual element objects. Each object must have:
  - label: The name of the element (e.g., "X-axis", "Parabola").
  - type: The kind of element (e.g., "graph", "equation-text", "point").
  - position: Its location (e.g., "bottom", "top-right").
  - description: Its purpose in the visualization.

Return only valid JSON. No markdown, no extra explanation.

Concept: "{concept}"
""",
    "Physical Sciences": """
You are a physics educator. Output a JSON object to visually explain a scientific principle, adhering to this structure:
- title: Name of the principle.
- layout: A description of the scene (e.g., "A central sun with planets orbiting in ellipses.").
- interaction: A description of how the visual responds to user action or animates (e.g., "Animation plays showing the conservation of momentum as two objects collide.").
- elements: A list of visual objects, each with a 'label', 'type', 'position', and 'description'.
Return only valid JSON. No markdown, no extra explanation.
Concept: "{concept}"
""",
    "Biological & Health Sciences": """
You are a biology educator. Output a JSON object to visually explain a biological concept, adhering to this structure:
- title: A clear title for the concept.
- layout: A description of the biological diagram (e.g., "A cross-section of a plant cell with major organelles visible.").
- interaction: A description of the dynamic aspect of the visual (e.g., "User clicks on an organelle to see its function displayed in a side panel.").
- elements: A list of visual objects (e.g., 'Mitochondria', 'Cell Wall'), each with a 'label', 'type', 'position', and 'description'.
Return only valid JSON. No markdown, no extra explanation.
Concept: "{concept}"
""",
    "Social Sciences": """
You are a sociologist. Output a JSON object to visually explain a social concept, adhering to this structure:
- title: A title for the social concept.
- layout: A description of the visual arrangement (e.g., "A network graph of nodes representing people and lines representing relationships.").
- interaction: A description of how it works (e.g., "User can toggle different social filters to see how connections change.").
- elements: A list of visual objects (e.g., 'Node', 'Connection', 'Group'), each with a 'label', 'type', 'position', and 'description'.
Return only valid JSON. No markdown, no extra explanation.
Concept: "{concept}"
""",
    "History & Civilization": """
You are a historian. Output a JSON object for a visual historical narrative, adhering to this structure:
- title: The name of the historical event or topic.
- layout: A description of the visual setup (e.g., "A vertical timeline with key dates, alongside an interactive map.").
- interaction: A description of how the user explores (e.g., "Scrolling the timeline highlights corresponding locations on the map.").
- elements: A list of visual objects (e.g., 'Event Marker', 'Map Region'), each with a 'label', 'type', 'position', and 'description'.
Return only valid JSON. No markdown, no extra explanation.
Concept: "{concept}"
""",
    "Philosophy & Ethics": """
You are a philosopher. Output a JSON object to visualize a philosophical concept, adhering to this structure:
- title: The name of the concept.
- layout: A description of the abstract visual metaphor (e.g., "A set of balancing scales representing utilitarian calculus.").
- interaction: A description of the interactive component (e.g., "User drags 'weights' of happiness onto the scales to see the ethical outcome.").
- elements: A list of symbolic objects, each with a 'label', 'type', 'position', and 'description'.
Return only valid JSON. No markdown, no extra explanation.
Concept: "{concept}"
""",
    "Economics & Business": """
You are an economist. Output a JSON object for a visual economic model, adhering to this structure:
- title: The name of the concept.
- layout: A description of the visual arrangement (e.g., "A standard supply and demand graph with price on the Y-axis and quantity on the X-axis.").
- interaction: A description of how it's used (e.g., "User drags the demand curve to the right to see the new equilibrium point.").
- elements: A list of visual objects (e.g., 'Supply Curve', 'Demand Curve'), each with a 'label', 'type', 'position', and 'description'.
Return only valid JSON. No markdown, no extra explanation.
Concept: "{concept}"
""",
    "Politics & Law": """
You are a political scientist. Output a JSON object to visually explain a political concept, adhering to this structure:
- title: The name of the concept.
- layout: A description of the visual structure (e.g., "A flowchart showing the three branches of government.").
- interaction: A description of how it works (e.g., "User clicks on a branch to expand it and see its powers and responsibilities.").
- elements: A list of visual objects (e.g., 'Legislative Branch', 'Executive Branch'), each with a 'label', 'type', 'position', and 'description'.
Return only valid JSON. No markdown, no extra explanation.
Concept: "{concept}"
""",
    "Art & Design": """
You are a design instructor. Output a JSON object to visually break down a design concept, adhering to this structure:
- title: The name of the concept or principle.
- layout: A description of the visual explanation (e.g., "A sample photograph with an overlay of the rule-of-thirds grid.").
- interaction: A description of the interactive element (e.g., "User can drag the grid lines to see how it changes the composition's balance.").
- elements: A list of visual objects (e.g., 'Grid Line', 'Focal Point'), each with a 'label', 'type', 'position', and 'description'.
Return only valid JSON. No markdown, no extra explanation.
Concept: "{concept}"
""",
    "Literature & Language": """
You are a linguistics expert. Output a JSON object to visually represent a literary or linguistic idea, adhering to this structure:
- title: The name of the concept.
- layout: A description of the visual diagram (e.g., "A narrative arc plotted on a graph of tension versus time.").
- interaction: A description of how it's explored (e.g., "User hovers over key points on the arc to read plot summaries for that stage.").
- elements: A list of visual objects (e.g., 'Exposition', 'Climax', 'Resolution'), each with a 'label', 'type', 'position', and 'description'.
Return only valid JSON. No markdown, no extra explanation.
Concept: "{concept}"
""",
    "Media & Communication": """
You are a communication theorist. Output a JSON object to visually model a media concept, adhering to this structure:
- title: The name of the model or concept.
- layout: A description of the diagram (e.g., "A diagram showing the Shannon-Weaver model of communication with all its parts.").
- interaction: A description of the animation (e.g., "An animated icon travels from the sender to the receiver, transforming as it passes through the 'noise' element.").
- elements: A list of visual objects (e.g., 'Sender', 'Encoder', 'Channel'), each with a 'label', 'type', 'position', and 'description'.
Return only valid JSON. No markdown, no extra explanation.
Concept: "{concept}"
""",
    "Education & Learning": """
You are a pedagogy specialist. Output a JSON object to visually explain a learning concept, adhering to this structure:
- title: The name of the educational theory or method.
- layout: A description of the visual representation (e.g., "Bloom's Taxonomy shown as a multi-layered pyramid.").
- interaction: A description of how it works (e.g., "User clicks on each level of the pyramid to see example learning activities and verbs.").
- elements: A list of visual objects for each level, each with a 'label', 'type', 'position', and 'description'.
Return only valid JSON. No markdown, no extra explanation.
Concept: "{concept}"
""",
    "Environment & Sustainability": """
You are an environmental scientist. Output a JSON object to visually explain an environmental concept, adhering to this structure:
- title: The name of the concept.
- layout: A description of the system diagram (e.g., "A flowchart of the carbon cycle showing atmospheric and terrestrial reservoirs.").
- interaction: A description of the animation (e.g., "Carbon animates from the atmosphere to plants and back through respiration and decomposition.").
- elements: A list of visual objects (e.g., 'Atmosphere', 'Plants', 'Fossil Fuels'), each with a 'label', 'type', 'position', and 'description'.
Return only valid JSON. No markdown, no extra explanation.
Concept: "{concept}"
""",
    "Lifestyle & Personal Development": """
You are a personal development coach. Output a JSON object to create an interactive tool, adhering to this structure:
- title: The name of the concept or tool.
- layout: A description of the visual tool (e.g., "A circular 'Wheel of Life' divided into 8 sections representing different life areas.").
- interaction: A description of how the user engages (e.g., "User can click and drag each section's edge to rate their satisfaction from 1 to 10.").
- elements: A list of visual objects for each life area (e.g., 'Career', 'Health'), each with a 'label', 'type', 'position', and 'description'.
Return only valid JSON. No markdown, no extra explanation.
Concept: "{concept}"
""",
}


async def classify_concept(concept: str) -> str:
    """Ask Gemini to classify the concept into one of the defined categories."""
    categories = list(CATEGORY_PROMPTS.keys())

    # Use a system message to set the context and a user message for the specific task
    prompt_messages = [
        {
            "role": "system",
            "content": "You are an intelligent classifier. Your task is to select the most appropriate category for a given concept from a predefined list. Respond with ONLY the exact category name.",
        },
        {
            "role": "user",
            "content": f"""Classify this concept: "{concept}"

Choose the most appropriate category from these options:
{chr(10).join(categories)}

Respond with ONLY the exact category name from the list above.""",
        },
    ]

    category = call_gemini_api(prompt_messages, temperature=0, max_tokens=50)

    # Clean up the response and fallback to default if needed
    category = category.strip()

    # Try to find exact match first
    for cat in categories:
        if cat.lower() == category.lower():
            return cat

    # If no exact match, try partial match
    for cat in categories:
        if cat.lower() in category.lower() or category.lower() in cat.lower():
            return cat

    print(
        f"Warning: Could not match category '{category}' to any predefined category. Using default."
    )
    return "Education & Learning"


async def generate_concept_visualization(concept: str):
    """Generate structured visualization JSON using the categorized prompt."""
    print(f"Step 1: Classifying concept '{concept}'...")
    category = await classify_concept(concept)
    print(f"Step 2: Classified as '{category}'. Generating visualization plan...")

    # Retrieve the specific prompt for the determined category and format it with the concept
    prompt_template = CATEGORY_PROMPTS.get(
        category, CATEGORY_PROMPTS["Education & Learning"]
    )
    final_prompt = prompt_template.format(concept=concept)

    # Use a system message to reinforce the JSON output requirement
    prompt_messages = [
        {
            "role": "system",
            "content": "You are a helpful assistant that outputs structured JSON data for educational visualizations. You must return ONLY valid JSON without any markdown formatting, explanations, or extra text.",
        },
        {
            "role": "user",
            "content": final_prompt
            + "\n\nIMPORTANT: Your response must be valid JSON only. Do not include any markdown code blocks, explanations, or other text.",
        },
    ]

    visualization_str = call_gemini_api(
        prompt_messages, temperature=0.3, max_tokens=1024
    )

    print("Step 3: Visualization plan received. Parsing JSON...")
    print(f"Raw response length: {len(visualization_str)}")

    # Clean the response to extract JSON
    cleaned_response = visualization_str.strip()

    # Remove any markdown code block formatting if present
    if cleaned_response.startswith("```"):
        lines = cleaned_response.split("\n")
        # Remove first line if it's ```json or ```
        if lines[0].strip().startswith("```"):
            lines = lines[1:]
        # Remove last line if it's ```
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        cleaned_response = "\n".join(lines)

    # Try to find JSON content between curly braces
    if not cleaned_response.strip().startswith("{"):
        # Look for JSON object in the response
        import re

        json_match = re.search(r"\{.*\}", cleaned_response, re.DOTALL)
        if json_match:
            cleaned_response = json_match.group(0)

    # Try to parse the string as JSON, with a fallback to return a default structure
    try:
        visualization_json = json.loads(cleaned_response)
        print("Successfully parsed JSON response")
    except json.JSONDecodeError as e:
        print(f"JSON Parse Error: {e}")
        print(f"Attempted to parse: {cleaned_response[:500]}...")

        # Return a fallback structure that matches the expected format
        visualization_json = {
            "title": concept.title(),
            "layout": f"A visual representation of {concept}",
            "interaction": f"Interactive elements to explore {concept}",
            "elements": [
                {
                    "label": "Main Component",
                    "type": "diagram",
                    "position": "center",
                    "description": f"Primary visual element explaining {concept}",
                },
                {
                    "label": "Details Panel",
                    "type": "text",
                    "position": "side",
                    "description": "Additional information and explanations",
                },
            ],
        }

    return {
        "concept": concept,
        "category": category,
        "visualization": visualization_json,
    }
