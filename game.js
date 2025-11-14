class RacingGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameRunning = false;
        this.score = 0;
        this.speed = 0;
        this.gameSpeed = 2;
        this.combo = 0;
        this.comboTimer = 0;
        this.selectedCarType = 0;
        this.screenShake = 0;
        this.maxSpeed = 0;
        this.speedMilestones = [500, 1000, 2000, 3500, 5000, 7500, 10000];
        this.currentMilestone = 0;
        this.gameMode = 'combat'; 
        this.ammo = 30;
        this.maxAmmo = 30;
        this.reloadTime = 0;
        this.maxReloadTime = 180; 
        this.shootCooldown = 0;
        
        this.sounds = {};
        this.initAudio();
        
        this.carTypes = [
            { name: 'SPEED DEMON', color: '#ff4444', speed: 6, health: 80, special: 'speed_boost' },
            { name: 'TANK CRUSHER', color: '#44ff44', speed: 4, health: 150, special: 'shield' }
        ];
        
        this.player = {
            x: this.canvas.width / 2 - 25,
            y: this.canvas.height - 120,
            width: 50,
            height: 80,
            speed: 5,
            color: '#ff4444',
            health: 100,
            maxHealth: 100,
            invulnerable: 0,
            specialCooldown: 0
        };
        
        this.enemies = [];
        this.bullets = [];
        this.enemyBullets = [];
        this.powerUps = [];
        this.particles = [];
        this.explosions = [];
        
       
        this.enemySpawnRate = 0.02;
        this.powerUpSpawnRate = 0.005;
        
        this.roadLines = [];
        this.stars = [];
        this.initRoadLines();
        this.initStars();
        
       
        this.activePowerUps = new Map();
        
     
        this.keys = {};
        this.setupControls();
        
        this.lastTime = 0;
        this.animate = this.animate.bind(this);
    }
    
    initRoadLines() {
        for (let i = 0; i < 20; i++) {
            this.roadLines.push({
                x: this.canvas.width / 2 - 5,
                y: i * 40 - 40,
                width: 10,
                height: 20
            });
        }
    }
    
    initStars() {
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 1,
                speed: Math.random() * 2 + 1,
                opacity: Math.random() * 0.8 + 0.2
            });
        }
    }
    
    setupControls() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            if (e.key === ' ' && this.gameRunning && this.gameMode === 'combat') {
                e.preventDefault();
                this.shoot();
            }
            
          
            if (e.key.toLowerCase() === 'x' && this.gameRunning) {
                this.useSpecialAbility();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
       
        document.querySelectorAll('.car-btn').forEach((btn, index) => {
            btn.addEventListener('click', () => {
                this.selectedCarType = index;
                document.querySelectorAll('.car-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }
    
    initAudio() {
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.audioEnabled = true;
        } catch (e) {
            console.log('Web Audio API not supported');
            this.audioEnabled = false;
            return;
        }
        
       
        this.sounds = {
            shoot: () => this.playShootSound(),
            enemyShoot: () => this.playEnemyShootSound(),
            explosion: () => this.playExplosionSound(),
            powerUp: () => this.playPowerUpSound(),
            engine: () => this.playEngineSound(),
            hit: () => this.playHitSound(),
            reload: () => this.playReloadSound(),
            speedBoost: () => this.playSpeedBoostSound()
        };
        
        console.log('Audio system initialized');
    }
    
    playShootSound() {
        if (!this.audioEnabled || !this.audioContext) return;
        
        try {
           
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.1);
            
            console.log('Shoot sound played');
        } catch (e) {
            console.log('Error playing shoot sound:', e);
        }
    }
    
    playEnemyShootSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.15);
        
        gainNode.gain.setValueAtTime(0.08, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.15);
    }
    
    playExplosionSound() {
        if (!this.audioEnabled || !this.audioContext) return;
        
        try {
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            oscillator.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.5);
            
            filter.frequency.setValueAtTime(2000, this.audioContext.currentTime);
            filter.frequency.exponentialRampToValueAtTime(500, this.audioContext.currentTime + 0.5);
            
            gainNode.gain.setValueAtTime(0.25, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.5);
            
            console.log('Explosion sound played');
        } catch (e) {
            console.log('Error playing explosion sound:', e);
        }
    }
    
    playPowerUpSound() {
        if (!this.audioEnabled || !this.audioContext) return;
        
        try {
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.3);
            
            gainNode.gain.setValueAtTime(0.12, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.3);
            
            console.log('Power-up sound played');
        } catch (e) {
            console.log('Error playing power-up sound:', e);
        }
    }
    
    playHitSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }
    
    playReloadSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(500, this.audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.08, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.08, this.audioContext.currentTime + 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }
    
    playSpeedBoostSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1000, this.audioContext.currentTime + 0.4);
        
        gainNode.gain.setValueAtTime(0.12, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.4);
    }
    
    spawnEnemy() {
        if (Math.random() < this.enemySpawnRate) {
            const lanes = [150, 250, 350, 450, 550];
            const enemyTypes = [
                { color: '#4444ff', health: 1, points: 10 },
                { color: '#ff44ff', health: 2, points: 20 },
                { color: '#ffaa44', health: 3, points: 30 }
            ];
            const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
            
            this.enemies.push({
                x: lanes[Math.floor(Math.random() * lanes.length)] - 25,
                y: -80,
                width: 50,
                height: 80,
                speed: this.gameSpeed + Math.random() * 2,
                color: type.color,
                health: type.health,
                maxHealth: type.health,
                points: type.points
            });
        }
    }
    
    spawnPowerUp() {
        if (Math.random() < this.powerUpSpawnRate) {
            const lanes = [150, 250, 350, 450, 550];
            const powerUpTypes = [
                { type: 'health', color: '#00ff00', symbol: '❤️' },
                { type: 'shield', color: '#0088ff', symbol: '🛡️' },
                { type: 'speed', color: '#ffff00', symbol: '⚡' },
                { type: 'multishot', color: '#ff8800', symbol: '🔥' }
            ];
            const powerUp = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
            
            this.powerUps.push({
                x: lanes[Math.floor(Math.random() * lanes.length)] - 15,
                y: -30,
                width: 30,
                height: 30,
                speed: this.gameSpeed,
                type: powerUp.type,
                color: powerUp.color,
                symbol: powerUp.symbol
            });
        }
    }
    
    shoot() {
        
        if (this.ammo <= 0 || this.shootCooldown > 0 || this.reloadTime > 0) {
            return;
        }
        
        const multishot = this.activePowerUps.has('multishot');
        const bulletCount = multishot ? 3 : 1;
        
       
        this.ammo--;
        this.shootCooldown = 10; 
        
        for (let i = 0; i < bulletCount; i++) {
            const offsetX = multishot ? (i - 1) * 20 : 0;
            this.bullets.push({
                x: this.player.x + this.player.width / 2 - 2 + offsetX,
                y: this.player.y,
                width: 4,
                height: 15,
                speed: 10,
                color: '#00ffff'
            });
        }
        
        
        this.createParticles(this.player.x + this.player.width / 2, this.player.y, '#00ffff', 5);
        
       
        this.sounds.shoot();
        
        
        if (this.ammo <= 0) {
            this.reloadTime = this.maxReloadTime;
            this.sounds.reload();
        }
    }
    
    useSpecialAbility() {
        if (this.player.specialCooldown > 0) return;
        
        const carType = this.carTypes[this.selectedCarType];
        
        switch (carType.special) {
            case 'speed_boost':
                this.activePowerUps.set('speed', 300); // 5 seconds
                this.player.specialCooldown = 600; // 10 seconds
                this.createParticles(this.player.x + this.player.width / 2, this.player.y + this.player.height, '#ffff00', 20);
                break;
                
            case 'shield':
                this.player.invulnerable = 300; // 5 seconds
                this.player.specialCooldown = 900; // 15 seconds
                this.createParticles(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, '#0088ff', 15);
                break;
                
            case 'teleport':
                this.player.y = Math.max(50, this.player.y - 200);
                this.player.invulnerable = 60; // 1 second
                this.player.specialCooldown = 480; // 8 seconds
                this.createParticles(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, '#ff44ff', 25);
                break;
        }
    }
    
    createParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 20,
                y: y + (Math.random() - 0.5) * 20,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                color: color,
                life: 60,
                maxLife: 60,
                size: Math.random() * 4 + 2
            });
        }
    }
    
    createExplosion(x, y) {
        this.explosions.push({
            x: x - 30,
            y: y - 30,
            life: 36,
            maxLife: 36
        });
        this.createParticles(x, y, '#ff6600', 15);
        this.screenShake = 10;
    }
    
    updatePlayer() {
        const carType = this.carTypes[this.selectedCarType];
        const speedMultiplier = this.activePowerUps.has('speed') ? 1.5 : 1;
        
        // Handle input
        if ((this.keys['arrowleft'] || this.keys['a']) && this.player.x > 100) {
            this.player.x -= this.player.speed * speedMultiplier;
        }
        if ((this.keys['arrowright'] || this.keys['d']) && this.player.x < this.canvas.width - 150) {
            this.player.x += this.player.speed * speedMultiplier;
        }
        if ((this.keys['arrowup'] || this.keys['w']) && this.player.y > 0) {
            this.player.y -= this.player.speed * 0.5 * speedMultiplier;
            this.speed = Math.min(this.speed + 1, 150);
        } else if ((this.keys['arrowdown'] || this.keys['s']) && this.player.y < this.canvas.height - this.player.height) {
            this.player.y += this.player.speed * 0.5;
            this.speed = Math.max(this.speed - 1, 0);
        } else {
            this.speed = Math.max(this.speed - 0.5, 80);
        }
        
        
        this.gameSpeed = 2 + (this.speed / 40);
        
       
        if (this.speed > this.maxSpeed) {
            this.maxSpeed = this.speed;
        }
        
      
        const milestoneMultiplier = this.gameMode === 'speed' ? 0.3 : 1;
        if (this.currentMilestone < this.speedMilestones.length && 
            this.score >= this.speedMilestones[this.currentMilestone] * milestoneMultiplier) {
            this.increaseSpeed();
            this.currentMilestone++;
        }
        
      
        if (this.gameMode === 'speed' && Math.random() < 0.002) {
            this.speed += 2; 
        }
        
        
        if (this.player.invulnerable > 0) this.player.invulnerable--;
        if (this.player.specialCooldown > 0) this.player.specialCooldown--;
        if (this.comboTimer > 0) this.comboTimer--;
        else this.combo = 0;
        
      
        if (this.gameMode === 'combat') {
            if (this.shootCooldown > 0) this.shootCooldown--;
            if (this.reloadTime > 0) {
                this.reloadTime--;
                if (this.reloadTime === 0) {
                    this.ammo = this.maxAmmo; 
                }
            }
        }
        
       
        if (Math.random() < 0.3) {
            this.createParticles(
                this.player.x + this.player.width / 2,
                this.player.y + this.player.height,
                this.player.color,
                2
            );
        }
    }
    
    increaseSpeed() {
      
        let speedIncrease = 15;
        let gameSpeedIncrease = 0.5;
        
        switch(this.gameMode) {
            case 'speed':
                speedIncrease = 35; 
                gameSpeedIncrease = 1.2;
                break;
            case 'combat':
                speedIncrease = 15; 
                gameSpeedIncrease = 0.5;
                break;
        }
        
        this.speed += speedIncrease;
        this.gameSpeed += gameSpeedIncrease;
        
       
        this.createParticles(
            this.player.x + this.player.width / 2,
            this.player.y + this.player.height / 2,
            '#ffff00',
            30
        );
        
       
        this.screenShake = 8;
        
       
        this.sounds.speedBoost();
        
        console.log(`🚀 SPEED MILESTONE REACHED! Mode: ${this.gameMode.toUpperCase()} - Speed +${speedIncrease}!`);
    }
    
    updateEnemies() {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            this.enemies[i].y += this.enemies[i].speed;
            
            
            if (this.gameMode === 'combat' && Math.random() < 0.01 && this.enemies[i].y > 50) {
                this.enemyShoot(this.enemies[i]);
            }
            
            
            if (this.enemies[i].y > this.canvas.height) {
                this.enemies.splice(i, 1);
                this.score += 5;
            }
        }
    }
    
    enemyShoot(enemy) {
        this.enemyBullets.push({
            x: enemy.x + enemy.width / 2 - 2,
            y: enemy.y + enemy.height,
            width: 4,
            height: 12,
            speed: 6,
            color: '#ff4444'
        });
        
      
        this.createParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height, '#ff4444', 3);
        
        
        this.sounds.enemyShoot();
    }
    
    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            this.bullets[i].y -= this.bullets[i].speed;
            
            
            if (this.bullets[i].y < 0) {
                this.bullets.splice(i, 1);
                continue;
            }
            
           
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                if (this.bullets[i] && 
                    this.bullets[i].x < this.enemies[j].x + this.enemies[j].width &&
                    this.bullets[i].x + this.bullets[i].width > this.enemies[j].x &&
                    this.bullets[i].y < this.enemies[j].y + this.enemies[j].height &&
                    this.bullets[i].y + this.bullets[i].height > this.enemies[j].y) {
                    
                   
                    this.enemies[j].health--;
                    this.bullets.splice(i, 1);
                    
                    if (this.enemies[j].health <= 0) {
                        
                        this.createExplosion(
                            this.enemies[j].x + this.enemies[j].width / 2,
                            this.enemies[j].y + this.enemies[j].height / 2
                        );
                        this.sounds.explosion();
                        this.score += this.enemies[j].points;
                        this.combo++;
                        this.comboTimer = 180; // 3 seconds
                        this.enemies.splice(j, 1);
                    } else {
                      
                        this.createParticles(
                            this.enemies[j].x + this.enemies[j].width / 2,
                            this.enemies[j].y + this.enemies[j].height / 2,
                            '#ff6600',
                            5
                        );
                    }
                    break;
                }
            }
        }
    }
    
    updateEnemyBullets() {
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            this.enemyBullets[i].y += this.enemyBullets[i].speed;
            
            
            if (this.enemyBullets[i].y > this.canvas.height) {
                this.enemyBullets.splice(i, 1);
                continue;
            }
            
           
            if (this.enemyBullets[i].x < this.player.x + this.player.width &&
                this.enemyBullets[i].x + this.enemyBullets[i].width > this.player.x &&
                this.enemyBullets[i].y < this.player.y + this.player.height &&
                this.enemyBullets[i].y + this.enemyBullets[i].height > this.player.y) {
                
               
                if (this.player.invulnerable <= 0) {
                    this.player.health -= 15;
                    this.player.invulnerable = 60; // 1 second
                    this.createParticles(
                        this.player.x + this.player.width / 2,
                        this.player.y + this.player.height / 2,
                        '#ff6600',
                        8
                    );
                    this.screenShake = 5;
                    this.sounds.hit();
                    
                    if (this.player.health <= 0) {
                        this.gameOver();
                        return;
                    }
                }
                
                this.enemyBullets.splice(i, 1);
            }
        }
    }
    
    updatePowerUps() {
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            this.powerUps[i].y += this.powerUps[i].speed;
           
            if (this.powerUps[i].y > this.canvas.height) {
                this.powerUps.splice(i, 1);
                continue;
            }
            
           
            if (this.powerUps[i].x < this.player.x + this.player.width &&
                this.powerUps[i].x + this.powerUps[i].width > this.player.x &&
                this.powerUps[i].y < this.player.y + this.player.height &&
                this.powerUps[i].y + this.powerUps[i].height > this.player.y) {
                
                this.collectPowerUp(this.powerUps[i]);
                this.powerUps.splice(i, 1);
            }
        }
    }
    
    collectPowerUp(powerUp) {
        switch (powerUp.type) {
            case 'health':
                this.player.health = Math.min(this.player.maxHealth, this.player.health + 30);
                break;
            case 'shield':
                this.player.invulnerable = 300; // 5 seconds
                break;
            case 'speed':
                this.activePowerUps.set('speed', 300); // 5 seconds
                break;
            case 'multishot':
                this.activePowerUps.set('multishot', 600); // 10 seconds
                break;
        }
        
        this.createParticles(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2, powerUp.color, 10);
        this.sounds.powerUp();
        this.score += 50;
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    updateExplosions() {
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            this.explosions[i].life--;
            if (this.explosions[i].life <= 0) {
                this.explosions.splice(i, 1);
            }
        }
    }
    
    updatePowerUpTimers() {
        for (let [key, timer] of this.activePowerUps) {
            this.activePowerUps.set(key, timer - 1);
            if (timer <= 1) {
                this.activePowerUps.delete(key);
            }
        }
    }
    
    updateStars() {
        for (let star of this.stars) {
            star.y += star.speed * (this.gameSpeed / 2);
            if (star.y > this.canvas.height) {
                star.y = -5;
                star.x = Math.random() * this.canvas.width;
            }
        }
    }
    
    updateRoadLines() {
        for (let line of this.roadLines) {
            line.y += this.gameSpeed;
            if (line.y > this.canvas.height) {
                line.y = -20;
            }
        }
    }
    
    checkCollisions() {
        if (this.player.invulnerable > 0) return;
        
        for (let enemy of this.enemies) {
            if (this.player.x < enemy.x + enemy.width &&
                this.player.x + this.player.width > enemy.x &&
                this.player.y < enemy.y + enemy.height &&
                this.player.y + this.player.height > enemy.y) {
                
                this.player.health -= 25;
                this.player.invulnerable = 120; // 2 seconds
                this.createExplosion(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2);
                this.screenShake = 15;
                this.sounds.hit();
                
                if (this.player.health <= 0) {
                    this.gameOver();
                    return;
                }
            }
        }
    }
    
    drawStars() {
        for (let star of this.stars) {
            this.ctx.save();
            this.ctx.globalAlpha = star.opacity;
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(star.x, star.y, star.size, star.size);
            this.ctx.restore();
        }
    }
    
    drawRoad() {
        const gradient = this.ctx.createLinearGradient(100, 0, this.canvas.width - 100, 0);
        gradient.addColorStop(0, '#333');
        gradient.addColorStop(0.5, '#555');
        gradient.addColorStop(1, '#333');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(100, 0, this.canvas.width - 200, this.canvas.height);
        
      
        this.ctx.shadowColor = '#00ffff';
        this.ctx.shadowBlur = 10;
        this.ctx.fillStyle = '#00ffff';
        this.ctx.fillRect(95, 0, 10, this.canvas.height);
        this.ctx.fillRect(this.canvas.width - 105, 0, 10, this.canvas.height);
        this.ctx.shadowBlur = 0;
        
       
        this.ctx.shadowColor = '#ffffff';
        this.ctx.shadowBlur = 5;
        this.ctx.fillStyle = '#ffffff';
        for (let line of this.roadLines) {
            this.ctx.fillRect(line.x, line.y, line.width, line.height);
        }
        this.ctx.shadowBlur = 0;
    }
    
    drawCar(car, isPlayer = false) {
        this.ctx.save();
        
      
        if (isPlayer && this.player.invulnerable > 0 && Math.floor(this.player.invulnerable / 5) % 2) {
            this.ctx.globalAlpha = 0.5;
        }
        
        
        if (isPlayer && this.player.invulnerable > 0) {
            this.ctx.shadowColor = '#0088ff';
            this.ctx.shadowBlur = 15;
        }
      
        const gradient = this.ctx.createLinearGradient(car.x, car.y, car.x, car.y + car.height);
        gradient.addColorStop(0, car.color);
        gradient.addColorStop(0.5, this.lightenColor(car.color, 20));
        gradient.addColorStop(1, this.darkenColor(car.color, 20));
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(car.x, car.y, car.width, car.height);
      
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(car.x + 5, car.y + 10, car.width - 10, 15);
        this.ctx.fillRect(car.x + 5, car.y + car.height - 25, car.width - 10, 15);
       
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(car.x - 3, car.y + 15, 8, 12);
        this.ctx.fillRect(car.x + car.width - 5, car.y + 15, 8, 12);
        this.ctx.fillRect(car.x - 3, car.y + car.height - 27, 8, 12);
        this.ctx.fillRect(car.x + car.width - 5, car.y + car.height - 27, 8, 12);
       
        if (!isPlayer && car.health < car.maxHealth) {
            const barWidth = car.width;
            const barHeight = 4;
            const healthPercent = car.health / car.maxHealth;
            
            this.ctx.fillStyle = '#ff0000';
            this.ctx.fillRect(car.x, car.y - 8, barWidth, barHeight);
            this.ctx.fillStyle = '#00ff00';
            this.ctx.fillRect(car.x, car.y - 8, barWidth * healthPercent, barHeight);
        }
        
        this.ctx.restore();
    }
    
    lightenColor(color, percent) {
        const num = parseInt(color.replace("#",""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)).toString(16).slice(1);
    }
    
    darkenColor(color, percent) {
        const num = parseInt(color.replace("#",""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R>255?255:R<0?0:R)*0x10000 + (G>255?255:G<0?0:G)*0x100 + (B>255?255:B<0?0:B)).toString(16).slice(1);
    }
    
    drawBullets() {
        for (let bullet of this.bullets) {
            this.ctx.save();
            this.ctx.shadowColor = bullet.color;
            this.ctx.shadowBlur = 10;
            this.ctx.fillStyle = bullet.color;
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            this.ctx.restore();
        }
    }
    
    drawEnemyBullets() {
        for (let bullet of this.enemyBullets) {
            this.ctx.save();
            this.ctx.shadowColor = bullet.color;
            this.ctx.shadowBlur = 8;
            this.ctx.fillStyle = bullet.color;
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            this.ctx.restore();
        }
    }
    
    drawPowerUps() {
        for (let powerUp of this.powerUps) {
            this.ctx.save();
            this.ctx.shadowColor = powerUp.color;
            this.ctx.shadowBlur = 15;
            this.ctx.fillStyle = powerUp.color;
            this.ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
           
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(powerUp.symbol, powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2 + 6);
            this.ctx.restore();
        }
    }
    
    drawParticles() {
        for (let particle of this.particles) {
            this.ctx.save();
            this.ctx.globalAlpha = particle.life / particle.maxLife;
            this.ctx.fillStyle = particle.color;
            this.ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
            this.ctx.restore();
        }
    }
    
    drawExplosions() {
        for (let explosion of this.explosions) {
            const progress = 1 - (explosion.life / explosion.maxLife);
            const size = 60 * progress;
            
            this.ctx.save();
            this.ctx.globalAlpha = explosion.life / explosion.maxLife;
            
            const gradient = this.ctx.createRadialGradient(
                explosion.x + 30, explosion.y + 30, 0,
                explosion.x + 30, explosion.y + 30, size
            );
            gradient.addColorStop(0, '#ffff00');
            gradient.addColorStop(0.5, '#ff6600');
            gradient.addColorStop(1, '#ff0000');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(explosion.x, explosion.y, size, size);
            this.ctx.restore();
        }
    }
    
    draw() {
        this.ctx.save();
        
        if (this.screenShake > 0) {
            this.ctx.translate(
                (Math.random() - 0.5) * this.screenShake,
                (Math.random() - 0.5) * this.screenShake
            );
            this.screenShake--;
        }
        
       
        const bgGradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        bgGradient.addColorStop(0, '#001122');
        bgGradient.addColorStop(0.5, '#002244');
        bgGradient.addColorStop(1, '#001122');
        this.ctx.fillStyle = bgGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
       
        this.drawStars();
      
        this.drawRoad();
     
        this.drawParticles();
        this.drawExplosions();
     
        if (this.gameMode === 'combat') {
            this.drawBullets();
            this.drawEnemyBullets();
            this.drawPowerUps();
        }
     
        this.drawCar(this.player, true);
        for (let enemy of this.enemies) {
            this.drawCar(enemy, false);
        }
        
        this.ctx.restore();
      
        this.updateUI();
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score + (this.combo > 1 ? ` (+${this.combo}x)` : '');
        document.getElementById('speed').textContent = Math.floor(this.speed);
        document.getElementById('combo').textContent = this.combo;
      
        const healthPercent = (this.player.health / this.player.maxHealth) * 100;
        document.getElementById('healthFill').style.width = healthPercent + '%';
        
        if (this.gameMode === 'combat') {
           
            document.querySelector('.weapon-info').style.display = 'block';
            
            const weaponType = this.activePowerUps.has('multishot') ? 'TRIPLE SHOT' : 'BLASTER';
            let ammoText = '';
            if (this.reloadTime > 0) {
                ammoText = `RELOADING... ${Math.ceil(this.reloadTime / 60)}s`;
            } else {
                ammoText = `${this.ammo}/${this.maxAmmo}`;
            }
            document.getElementById('weaponType').textContent = weaponType;
            document.querySelector('.ammo').textContent = ammoText;
            
            const powerUpsContainer = document.getElementById('powerUps');
            powerUpsContainer.innerHTML = '';
            
            for (let [type, timer] of this.activePowerUps) {
                const powerUpDiv = document.createElement('div');
                powerUpDiv.className = 'power-up';
                
                const symbols = {
                    'speed': '⚡',
                    'shield': '🛡️',
                    'multishot': '🔥'
                };
                
                const colors = {
                    'speed': '#ffff00',
                    'shield': '#0088ff',
                    'multishot': '#ff8800'
                };
                
                powerUpDiv.textContent = symbols[type] || '?';
                powerUpDiv.style.backgroundColor = colors[type] || '#ffffff';
                powerUpDiv.style.borderColor = colors[type] || '#ffffff';
                powerUpDiv.title = `${type.toUpperCase()}: ${Math.ceil(timer / 60)}s`;
                
                powerUpsContainer.appendChild(powerUpDiv);
            }
        } else {
          
            document.querySelector('.weapon-info').style.display = 'none';
            document.getElementById('powerUps').innerHTML = '';
        }
    }
    
    update() {
        if (!this.gameRunning) return;
        
        this.spawnEnemy();
        
        if (this.gameMode === 'combat') {
            this.spawnPowerUp();
            this.updateBullets();
            this.updateEnemyBullets();
            this.updatePowerUps();
            this.updatePowerUpTimers();
        }
        
        this.updatePlayer();
        this.updateEnemies();
        this.updateParticles();
        this.updateExplosions();
        this.updateRoadLines();
        this.updateStars();
        this.checkCollisions();
        
        if (this.gameMode === 'speed') {
          
            this.enemySpawnRate = Math.min(0.12, 0.03 + (this.score / 2000));
        } else if (this.gameMode === 'combat') {
           
            this.enemySpawnRate = Math.min(0.08, 0.02 + (this.score / 3000));
            this.powerUpSpawnRate = Math.min(0.01, 0.005 + (this.score / 10000));
        }
    }
    
    animate(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update();
        this.draw();
        
        if (this.gameRunning) {
            requestAnimationFrame(this.animate);
        }
    }
    
    start() {
        this.gameRunning = true;
        this.score = 0;
        this.combo = 0;
        this.comboTimer = 0;
        this.speed = 80;
        this.gameSpeed = 2;
        this.screenShake = 0;
        this.maxSpeed = 80;
        this.currentMilestone = 0;
    
        this.enemies = [];
        this.bullets = [];
        this.enemyBullets = [];
        this.powerUps = [];
        this.particles = [];
        this.explosions = [];
        this.activePowerUps.clear();
        
        this.ammo = this.maxAmmo;
        this.reloadTime = 0;
        this.shootCooldown = 0;
      
        this.enemySpawnRate = 0.02;
        this.powerUpSpawnRate = 0.005;
     
        const carType = this.carTypes[this.selectedCarType];
        this.player = {
            x: this.canvas.width / 2 - 25,
            y: this.canvas.height - 120,
            width: 50,
            height: 80,
            speed: carType.speed,
            color: carType.color,
            health: carType.health,
            maxHealth: carType.health,
            invulnerable: 0,
            specialCooldown: 0
        };
    
        document.getElementById('startScreen').classList.add('hidden');
        document.getElementById('gameOver').classList.add('hidden');
        document.querySelector('.hud-top').style.display = 'flex';
        document.querySelector('.hud-bottom').style.display = 'flex';
        
        this.screenShake = 5;
        
        if (this.audioEnabled && this.audioContext) {
            console.log('Testing audio system...');
            setTimeout(() => {
                this.sounds.speedBoost();
            }, 500);
        }
        
        requestAnimationFrame(this.animate);
    }
    
    gameOver() {
        this.gameRunning = false;
      
        this.createExplosion(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2);
        this.screenShake = 20;
        this.sounds.explosion();
        
        document.querySelector('.hud-top').style.display = 'none';
        document.querySelector('.hud-bottom').style.display = 'none';
        
        document.querySelector('.game-container').classList.add('screen-shake');
        setTimeout(() => {
            document.querySelector('.game-container').classList.remove('screen-shake');
        }, 500);
        
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('maxSpeed').textContent = Math.floor(this.maxSpeed);
        document.getElementById('gameOver').classList.remove('hidden');
    }
}

const game = new RacingGame();

function startGame() {
  
    if (game.audioContext) {
        if (game.audioContext.state === 'suspended') {
            game.audioContext.resume().then(() => {
                console.log('Audio context resumed');
            });
        }
        console.log('Audio context state:', game.audioContext.state);
    } else {
        console.log('No audio context available');
    }
    game.start();
}

function restartGame() {
    game.start();
}

function showGameMenu() {
    document.getElementById('gameOver').classList.add('hidden');
    document.getElementById('gameMenu').classList.remove('hidden');
}

function backToRacing() {
    document.getElementById('gameMenu').classList.add('hidden');
    document.getElementById('startScreen').classList.remove('hidden');
   
    document.querySelector('.hud-top').style.display = 'none';
    document.querySelector('.hud-bottom').style.display = 'none';
}

function selectGameMode(mode) {
   
    document.querySelectorAll('.game-card').forEach(card => {
        card.classList.remove('active');
    });
    
    event.target.closest('.game-card').classList.add('active');
    
    switch(mode) {
        case 'speed':
            game.gameMode = 'speed';
            game.selectedCarType = 0; // Speed Demon
            break;
        case 'combat':
            game.gameMode = 'combat';
            game.selectedCarType = 1; // Tank Crusher
            break;
        default:
            console.log('Unknown game mode:', mode);
            return;
    }
    
    document.querySelectorAll('.car-btn').forEach((btn, index) => {
        btn.classList.remove('active');
        if (index === game.selectedCarType) {
            btn.classList.add('active');
        }
    });
    
    document.getElementById('gameMenu').classList.add('hidden');
    document.getElementById('startScreen').classList.remove('hidden');
    
    document.querySelector('.hud-top').style.display = 'none';
    document.querySelector('.hud-bottom').style.display = 'none';
}

document.getElementById('startScreen').classList.remove('hidden');
document.getElementById('gameMenu').classList.add('hidden');
document.getElementById('gameOver').classList.add('hidden');

if (document.querySelector('.hud-top')) {
    document.querySelector('.hud-top').style.display = 'none';
}
if (document.querySelector('.hud-bottom')) {
    document.querySelector('.hud-bottom').style.display = 'none';
}
