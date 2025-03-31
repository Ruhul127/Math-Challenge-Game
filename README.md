# 🧮 Math Challenge Game

![Game Screenshot]()  
*Replace with an actual screenshot*

A fun and interactive web-based math puzzle game where players use numbers and operations to reach a target value. Built with Flask, JavaScript, and CSS.

## ✨ Features

- 🎯 **Dynamic Challenges** – Randomly generated target numbers and number sets.
- ⏳ **Timed Mode** – Complete challenges before time runs out, with a visual progress indicator.
- 🧩 **Drag-and-Drop Gameplay** – Build equations intuitively by dragging numbers.
- ✅ **Real-Time Validation** – Instantly check if your equation solves the challenge.
- 💡 **AI-Powered Hints** – Get smart suggestions using the OpenAI API.
- 🏆 **Victory Celebrations** – Animated effects when you reach the target number.
- 🔄 **Endless Replayability** – Generate new number sets anytime.
- 📱 **Responsive Design** – Works smoothly on desktops, tablets, and mobile devices.

## 🛠️ Technologies Used

- **Backend**: Python (Flask)
- **Frontend**: HTML5, CSS3, JavaScript
- **AI Integration**: OpenAI API (GPT-3.5)
- **Styling**: Custom CSS with CSS variables
- **Deployment**: *(Specify platform, e.g., Heroku, Vercel, AWS, etc.)*

## 🚀 Installation & Setup

Follow these steps to set up the game on your local machine:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/math-challenge-game.git
   cd math-challenge-game
   ```

2. **Create and activate a virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**:
   ```bash
   echo "OPENAI_API_KEY=your_api_key_here" > .env
   ```

5. **Run the application**:
   ```bash
   flask run
   ```

6. **Open your browser and play**:
   ```
   http://localhost:5000
   ```

## ⚙️ Configuration

Modify `app.py` to customize the game settings:
- Adjust difficulty (number range & targets)
- Change the timer duration
- Tweak OpenAI model parameters for hints

## 🎮 How to Play

1. A target number and six available numbers are displayed.
2. Drag numbers into the equation builder.
3. Use operation buttons (+, -, ×, ÷) to form an equation.
4. Add parentheses for complex operations if needed.
5. Click **"Check Solution"** to validate your equation.
6. Try to match the target number exactly!

## 📂 Project Structure

```
math-challenge-game/
├── static/
│   ├── script.js       # Game logic and interactions
│   └── style.css       # Game styling
├── templates/
│   ├── base.html       # Base template
│   ├── index.html      # Main game page
│   └── about.html      # About page
├── app.py              # Flask application
├── requirements.txt    # Python dependencies
├── .env.example        # Example environment variables file
└── README.md           # This file
```
