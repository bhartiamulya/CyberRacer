# Cyber Racer

A browser-based racing game with two distinct game modes: pure speed racing and combat racing. Built with vanilla JavaScript, HTML5 Canvas, and Web Audio API.

## Features

### Game Modes
- **Speed Demon**: Pure racing focused on speed and dodging
- **Tank Crusher**: Combat racing with shooting mechanics

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

## File Structure

```
racing-car-game/
├── index.html          # Main HTML structure
├── style.css           # Cyberpunk-themed styling
├── game.js             # Complete game engine
├── .gitignore          # Git ignore rules
└── README.md           # Project documentation
```

