# Cyber Racer

A browser-based racing game with two distinct game modes: pure speed racing and combat racing. Built with vanilla JavaScript, HTML5 Canvas, and Web Audio API.

## Features

### Game Modes
- **Speed Demon**: Pure racing focused on speed and dodging
- **Tank Crusher**: Combat racing with shooting mechanics

### Core Gameplay
- Smooth car controls (WASD/Arrow keys)
- Dynamic enemy spawning with increasing difficulty
- Real-time collision detection
- Progressive speed milestones
- Health system with visual feedback
- Combo scoring system

### Visual Effects
- Particle systems for explosions and exhaust trails
- Screen shake effects
- Gradient backgrounds with animated starfield
- Glowing UI elements with cyberpunk aesthetic
- Real-time health bars and damage indicators

### Audio System
- Procedural sound effects using Web Audio API
- Shooting, explosion, and impact sounds
- Power-up collection audio feedback
- Speed milestone achievement sounds

## Game Modes

### Speed Demon Mode
- **Focus**: Pure speed and agility
- **Mechanics**: No combat, only movement
- **Progression**: Faster speed milestones (70% more frequent)
- **Speed Boosts**: +35 mph per milestone
- **Challenge**: Dodge increasingly frequent enemies

### Tank Crusher Mode
- **Focus**: Combat racing with strategy
- **Mechanics**: Limited ammo system (30 bullets)
- **Reload System**: 3-second reload time when ammo depleted
- **Enemy Combat**: Enemies shoot back at player
- **Power-ups**: Health, shield, speed boost, multi-shot
- **Speed Boosts**: +15 mph per milestone (balanced for combat)

## Controls

- **Movement**: WASD or Arrow Keys
- **Shooting**: Space Bar (Tank Crusher mode only)
- **Special Ability**: X key
- **Menu Navigation**: Mouse clicks

## Technical Implementation

### Architecture
- Object-oriented JavaScript design
- Modular game systems (physics, rendering, audio)
- 60 FPS game loop with requestAnimationFrame
- Responsive canvas-based rendering

### Performance
- Efficient particle system management
- Optimized collision detection
- Memory-conscious object pooling for bullets/particles
- Smooth animations with delta time calculations

### Browser Compatibility
- Modern browsers with HTML5 Canvas support
- Web Audio API for sound effects
- Responsive design for different screen sizes

## File Structure

```
racing-car-game/
├── index.html          # Main HTML structure
├── style.css           # Cyberpunk-themed styling
├── game.js             # Complete game engine
├── .gitignore          # Git ignore rules
└── README.md           # Project documentation
```

## Getting Started

1. Clone or download the project files
2. Open `index.html` in a modern web browser
3. Select your preferred game mode
4. Choose your car type
5. Click "Start Game" to begin

## Browser Requirements

- HTML5 Canvas support
- Web Audio API support
- ES6 JavaScript features
- Modern browser (Chrome 60+, Firefox 55+, Safari 11+)

## Development

The game is built with vanilla web technologies:

- **HTML5**: Structure and canvas element
- **CSS3**: Styling with animations and gradients
- **JavaScript ES6**: Game logic and systems
- **Web Audio API**: Procedural sound generation

No build process or external dependencies required.

## License

This project is open source and available under the MIT License.
