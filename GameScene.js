const gameState = {
  score: 0,
  starRating: 5,
  currentWaveCount: 1,
  customerIsReady: false,
  cam: {},
  gameSpeed: 3,
  currentMusic: {},
  totalWaveCount: 3,
  countdownTimer: 1500,
  readyForNextOrder: true,
  customersServedCount: 0,
  serviceCountdown: {}
}

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' })
  }

  preload() {
    // Preload images
    const baseURL = 'https://content.codecademy.com/courses/learn-phaser/fastfoodie/';
    this.load.image('Chef', `${baseURL}art/Chef.png`);
    this.load.image('Customer-1', `${baseURL}art/Customer-1.png`);
    this.load.image('Customer-2', `${baseURL}art/Customer-2.png`);
    this.load.image('Customer-3', `${baseURL}art/Customer-3.png`);
    this.load.image('Customer-4', `${baseURL}art/Customer-4.png`);
    this.load.image('Customer-5', `${baseURL}art/Customer-5.png`);
    this.load.image('Floor-Server', `${baseURL}art/Floor-Server.png`);
    this.load.image('Floor-Customer', `${baseURL}art/Floor-Customer.png`);
    this.load.image('Tray', `${baseURL}art/Tray.png`);
    this.load.image('Barrier', `${baseURL}art/Barrier.png`);
    this.load.image('Star-full', `${baseURL}art/Star-full.png`);
    this.load.image('Star-half', `${baseURL}art/Star-half.png`);
    this.load.image('Star-empty', `${baseURL}art/Star-empty.png`);

    // Preload song
    this.load.audio('gameplayTheme', [
      `${baseURL}audio/music/2-gameplayTheme.ogg`,
      `${baseURL}audio/music/2-gameplayTheme.mp3`
    ]); // Credit: "Pixel Song #18" by hmmm101: https://freesound.org/people/hmmm101

    // Preload SFX
    this.load.audio('placeFoodSFX', [
      `${baseURL}audio/sfx/placeFood.ogg`,
      `${baseURL}audio/sfx/placeFood.mp3`
    ]); // Credit: "action_02.wav" by dermotte: https://freesound.org/people/dermotte

    this.load.audio('servingCorrectSFX', [
      `${baseURL}audio/sfx/servingCorrect.ogg`,
      `${baseURL}audio/sfx/servingCorrect.mp3`
    ]); // Credit: "Video Game SFX Positive Action Long Tail" by rhodesmas: https://freesound.org/people/djlprojects

    this.load.audio('servingIncorrectSFX', [
      `${baseURL}audio/sfx/servingIncorrect.ogg`,
      `${baseURL}audio/sfx/servingIncorrect.mp3`
    ]); // Credit: "Incorrect 01" by rhodesmas: https://freesound.org/people/rhodesmas

    this.load.audio('servingEmptySFX', [
      `${baseURL}audio/sfx/servingEmpty.ogg`,
      `${baseURL}audio/sfx/servingEmpty.mp3`
    ]); // Credit: "Computer Error Noise [variants of KevinVG207's Freesound#331912].wav" by Timbre: https://freesound.org/people/Timbre

    this.load.audio('fiveStarsSFX', [
      `${baseURL}audio/sfx/fiveStars.ogg`,
      `${baseURL}audio/sfx/fiveStars.mp3`
    ]); // Credit: "Success 01" by rhodesmas: https://freesound.org/people/rhodesmas

    this.load.audio('nextWaveSFX', [
      `${baseURL}audio/sfx/nextWave.ogg`,
      `${baseURL}audio/sfx/nextWave.mp3`
    ]); // Credit: "old fashion radio jingle 2.wav" by rhodesmas: https://freesound.org/people/chimerical
  }

  create() {
    // reset values by restarting game
    this.restartGame();

    // Stop, reassign, and play the new music
    gameState.currentMusic.stop();
    gameState.currentMusic = this.sound.add('gameplayTheme');
    gameState.currentMusic.play({ loop: true });

    // Assign SFX
    gameState.sfx = {};
    gameState.sfx.placeFood = this.sound.add('placeFoodSFX');
    gameState.sfx.servingCorrect = this.sound.add('servingCorrectSFX');
    gameState.sfx.servingIncorrect = this.sound.add('servingIncorrectSFX');
    gameState.sfx.servingEmpty = this.sound.add('servingEmptySFX');
    gameState.sfx.fiveStars = this.sound.add('fiveStarsSFX');
    gameState.sfx.nextWave = this.sound.add('nextWaveSFX');

    // Create environment sprites
    gameState.floorServer = this.add.sprite(gameState.cam.midPoint.x, 0, 'Floor-Server').setScale(0.5).setOrigin(0.5, 0);
    gameState.floorCustomer = this.add.sprite(gameState.cam.midPoint.x, gameState.cam.worldView.bottom, 'Floor-Customer').setScale(0.5).setOrigin(0.5, 1);
    gameState.table = this.add.sprite(gameState.cam.midPoint.x, gameState.cam.midPoint.y, 'Barrier').setScale(0.5);

    // Create player and tray sprites
    gameState.tray = this.add.sprite(gameState.cam.midPoint.x, gameState.cam.midPoint.y, 'Tray').setScale(0.5);
    gameState.player = this.add.sprite(gameState.cam.midPoint.x, 200, 'Chef').setScale(0.5);

    // Display the score
    gameState.scoreTitleText = this.add.text(gameState.cam.midPoint.x, 90, 'Score', { fontSize: '15px', fontWeight: 'bold', fill: '#000000' }).setOrigin(0.5);
    gameState.scoreText = this.add.text(gameState.cam.midPoint.x, gameState.scoreTitleText.y + gameState.scoreTitleText.height + 15, gameState.score, { fontSize: '30px', fontWeight: 'bold', fill: '#000000' }).setOrigin(0.5);

    // Display the wave count
    gameState.waveTitleText = this.add.text(gameState.cam.worldView.right - 85, 55, 'Wave', { fontSize: '64px', fontWeight: 'bold', fill: '#000000' }).setOrigin(1, 1).setScale(0.25);
    gameState.waveCountText = this.add.text(gameState.cam.worldView.right - 20, 30, gameState.currentWaveCount + '/' + gameState.totalWaveCount, { fontSize: '120px', fontWeight: 'bold', fill: '#000000' }).setOrigin(1, 0).setScale(0.25);

    // Display number of customers left
    gameState.customerCountText = this.add.text(gameState.cam.worldView.right - 20, 80, `Customers left: ${gameState.customersLeftCount}`, { fontSize: '15px', fontWeight: 'bold', fill: '#000000' }).setOrigin(1);
    
    // rating the restaurant
    gameState.starGroup = this.add.group();
    this.drawStars();

    // Generate wave group
    gameState.customers = this.add.group();
    this.generateWave();

    // keep track of meals
    gameState.currentMeal = this.add.group();
    gameState.currentMeal.fullnessValue = 0;

    // create keys to feed customers
    gameState.keys.Enter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    gameState.keys.A = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    gameState.keys.S = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    gameState.keys.D = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

  } // end of create()

  update() {
    // checking if the chef finished the previous order and is ready for the next customer
    if (gameState.readyForNextOrder) {
      gameState.readyForNextOrder = false;
      
      gameState.customerIsReady = false;
      
      if (gameState.customersServedCount > 0) {
        // hide fullness meter of previous customer
        gameState.currentCustomer.meterContainer.visible = false;
      
        // Move the currentCustomer before getting a new one
        for (let i = 0; i < gameState.customersServedCount; i++) {
          gameState.previousCustomer = gameState.customers.children.entries[i];
          this.tweens.add({
            targets: gameState.previousCustomer,
            duration: 750,
            x: '-=300',
            angle: 0,
            ease: 'Power2'
          });
        }
      }
      
      // setting the current customer
      gameState.currentCustomer = gameState.customers.children.entries[gameState.customersServedCount];

      // tween to move the customer to the front of the line
      this.tweens.add({
        targets: gameState.currentCustomer,
        duration: 1000,
        delay: 100,
        angle: 90,
        x: gameState.player.x,
        ease: 'Power2',
        onComplete: () => {
          gameState.currentCustomer.meterContainer.visible = true;
          gameState.customerIsReady = true;

          // if player is taking too long, move to next customer
          gameState.serviceCountdown = this.time.delayedCall(gameState.countdownTimer * gameState.gameSpeed, function () {
            this.moveCustomerLine();
          }, [], this);
        }
      });

      // move customers down the line to be served
      for (let j = 0; j < gameState.customersLeftCount; j++) {
        let nextCustomer = gameState.customers.children.entries[gameState.customersServedCount + 1 + j];
        this.tweens.add({
          targets: nextCustomer,
          delay: 200,
          x: '-=200',
          durantion: 1500,
          ease: 'Power2'
        });
      }
    }

    // customer is waiting to be served
    if (gameState.customerIsReady) {
      // creating timer meter
      gameState.currentCustomer.timerMeterBody.width = gameState.currentCustomer.meterBase.width - (gameState.serviceCountdown.getProgress() * gameState.currentCustomer.meterBase.width);

      if (gameState.serviceCountdown.getProgress() > .75) {
        // timer is closing in - change color to red
        gameState.currentCustomer.timerMeterBody.setFillStyle(0xDB533A);
      } else if (gameState.serviceCountdown.getProgress() > .25) {
        // timer is between .25 and .75 - change color to orange
        gameState.currentCustomer.timerMeterBody.setFillStyle(0xFF9D00);
      } else {
        // timer is between less than .25 - change color to green
        gameState.currentCustomer.timerMeterBody.setFillStyle(0x3ADB40);
      }
    }

    // KEYS
    // press keys to feed customers
    if (Phaser.Input.Keyboard.JustDown(gameState.keys.A)) {
      // press A to feed a burger
      this.placeFood('Burger', 5);
    } else if (Phaser.Input.Keyboard.JustDown(gameState.keys.S)) {
      // press S to feed fries
      this.placeFood('Fries', 3);
    } else if (Phaser.Input.Keyboard.JustDown(gameState.keys.D)) {
      // press D to feed a shake
      this.placeFood('Shake', 1);
    }
    // after serving food, when enter is pressed move the line and update count
    if (Phaser.Input.Keyboard.JustDown(gameState.keys.Enter)) {
      if (!gameState.readyForNextOrder && gameState.customerIsReady) {
        gameState.serviceCountdown.remove();
        this.moveCustomerLine();
        this.updateCustomerCountText();
      }
    }
  } // end of update()

  /* WAVES */
  generateWave() {
    // Add the total number of customers per wave here:
    gameState.totalCustomerCount = Math.ceil(Math.random() * 20);

    // check customersServedCount to 0
    gameState.customersServedCount = 0;

    // to update the customers left count text
    this.updateCustomerCountText();

    for (let i = 0; i < gameState.totalCustomerCount; i++) {
      // Create your container below and add your customers to it below:
      let customerContainer = this.add.container(gameState.cam.worldView.right + (200 * i), gameState.cam.worldView.bottom - 140);
      gameState.customers.add(customerContainer);

      // Customer sprite randomizer
      let customerImageKey = Math.ceil(Math.random() * 5);

      // Draw customers here!
      let customer = this.add.sprite(0, 0, `Customer-${customerImageKey}`).setScale(0.5);
      customerContainer.add(customer);

      // Fullness meter container
      customerContainer.fullnessMeter = this.add.group();

      // Define capacity
      customerContainer.fullnessCapacity = Math.ceil(Math.random() * 5 * gameState.totalWaveCount);

      // If capacity is an impossible number, reshuffle it until it isn't
      while (customerContainer.fullnessCapacity === 12 || customerContainer.fullnessCapacity === 14) {
        customerContainer.fullnessCapacity = Math.ceil(Math.random() * 5) * gameState.totalWaveCount;
      }

      // Edit the meterWidth
      let meterWidth = customerContainer.fullnessCapacity * 10;
      customerContainer.meterContainer = this.add.container(0, customer.y + (meterWidth / 2));
      
      // Add the customerContainer.meterContainer to customerContainer
      customerContainer.add(customerContainer.meterContainer);

      // Add meter base
      customerContainer.meterBase = this.add.rectangle(-130, customer.y, meterWidth, 33, 0x707070).setOrigin(0);
      customerContainer.meterBase.setStrokeStyle(6, 0x707070);
      customerContainer.meterBase.angle = -90;
      customerContainer.meterContainer.add(customerContainer.meterBase);

      // Add timer countdown meter body
      customerContainer.timerMeterBody = this.add.rectangle(customerContainer.meterBase.x + 22, customer.y + 1, meterWidth + 4, 12, 0x3ADB40).setOrigin(0);
      customerContainer.timerMeterBody.angle = -90;
      customerContainer.meterContainer.add(customerContainer.timerMeterBody);

      // Create container for individual fullness blocks
      customerContainer.fullnessMeterBlocks = [];

      // Create fullness meter blocks
      for (let j = 0; j < customerContainer.fullnessCapacity; j++) {
        customerContainer.fullnessMeterBlocks[j] = this.add.rectangle(customerContainer.meterBase.x, customer.y - (10 * j), 10, 20, 0xDBD53A).setOrigin(0);
        customerContainer.fullnessMeterBlocks[j].setStrokeStyle(2, 0xB9B42E);
        customerContainer.fullnessMeterBlocks[j].angle = -90;
        customerContainer.fullnessMeter.add(customerContainer.fullnessMeterBlocks[j]);
        customerContainer.meterContainer.add(customerContainer.fullnessMeterBlocks[j]);
      }
      
      // Hide meters
      customerContainer.meterContainer.visible = false;
    }
  } // end of generateWave()

  updateCustomerCountText() {
    gameState.customersLeftCount = gameState.totalCustomerCount - gameState.customersServedCount;
    gameState.customerCountText.setText(`Customers left: ${gameState.customersLeftCount}`);
    gameState.waveCountText.setText(`${gameState.currentWaveCount}/${gameState.totalWaveCount}`);
  }

  placeFood(food, fullnessValue) {
    // make sure you only feed the customers if they are ready
    if (gameState.currentMeal.children.entries.length < 3 && gameState.customerIsReady) {
      // play audible when food is placed in the tray
      gameState.sfx.placeFood.play();

      // define the x position to display the food
      let xPosition = gameState.tray.x;
      switch (gameState.currentMeal.children.entries.length) {
        case 0:
          xPosition -= 90;
          break;
        case 2:
          xPosition += 90;
          break;
      }
      
      // create the food
      gameState.currentMeal.create(xPosition, gameState.tray.y, food).setScale(0.5);

      // adding fullnessValue will tell the game how much the customer has been served
      gameState.currentMeal.fullnessValue += fullnessValue;
    
      // color the customer’s fullness capacity bars in different colors based on how filling the meal is
      for (let i = 0; i < gameState.currentMeal.fullnessValue; i++) {
        if (i < gameState.currentCustomer.fullnessCapacity) {
          // the customer is exactly full
          if (gameState.currentCustomer.fullnessCapacity === gameState.currentMeal.fullnessValue) {
            gameState.currentCustomer.fullnessMeterBlocks[i].setFillStyle(0x3ADB40).setStrokeStyle(2, 0x2EB94E);
          
          // the customer is too full
          } else if (gameState.currentMeal.fullnessValue > gameState.currentCustomer.fullnessCapacity) {
            gameState.currentCustomer.fullnessMeterBlocks[i].setFillStyle(0xDB533A).setStrokeStyle(2, 0xB92E2E);
          
          // the customer isn’t full at all
          } else {
            gameState.currentCustomer.fullnessMeterBlocks[i].setFillStyle(0xFFFA81);
          }
        }
      }
    }
  } // end of placeFood()

  moveCustomerLine() {
    // set the current customer fullness values
    gameState.currentCustomer.fullnessValue = gameState.currentMeal.fullnessValue;

    this.updateStars(game, gameState.currentCustomer.fullnessValue, gameState.currentCustomer.fullnessCapacity);

    // reset the current meal and fullness
    gameState.currentMeal.clear(true);
    gameState.currentMeal.fullnessValue = 0;

    // increase the number of customers served
    gameState.customersServedCount++;

    // when all the customers are served in a wave 
    if (gameState.customersServedCount === gameState.totalCustomerCount) {
      // increave wave count
      gameState.currentWaveCount++;

      // end the game after 3 waves
      if (gameState.currentWaveCount > gameState.totalWaveCount) {
        gameState.currentMusic.stop();
        this.scene.stop('GameScene');
        this.scene.start('WinScene');
      } else {
        // destroy the wave and generate a new one and decreased speed
        this.destroyWave();
        gameState.gameSpeed--;
      }
    } else {
      gameState.readyForNextOrder = true;
    }
  }

  drawStars() {
    // define star group location
    let starXPosition = 20;
    
    // reset starts 
    gameState.starGroup.clear(true);

    // create stars for each starRating point
    for (let i = 0; i < gameState.starRating; i++) {
      gameState.starGroup.create(starXPosition + (50 * i), 20, 'Star-full').setOrigin(0).setScale(0.5);
    }
  }

  updateStars() {
    // customer is full
    if (gameState.currentMeal.fullnessValue === gameState.currentCustomer.fullnessCapacity) {
      // change customer color
      gameState.currentCustomer.list[0].setTint(0x3ADB40);
      gameState.sfx.servingCorrect.play();
      gameState.score += 100;
      gameState.scoreText.setText(gameState.score);
      
      // adding star rate
      if (gameState.starRating < 5) {
        gameState.starRating++;
      
        // if the player already has 5 stars, play the audible
        if (gameState.starRating === 5) {
          gameState.sfx.fiveStars.play();
        }
      }
    } else if (gameState.starRating > 1) {
      // if customers are too full, remove a star
      if (gameState.fullnessValue > 0) {
        gameState.starRating--; 
        // change customer color to orange
        gameState.currentCustomer.list[0].setTint(0xDB533A);
        gameState.sfx.servingIncorrect.play();
      } else {
        // change customer color to red, because they are still hungry
        gameState.starRating -= 2;
        gameState.currentCustomer.list[0].setTint(0xDB9B3A);
        gameState.sfx.servingEmpty.play();
      }

      // if player has 1 or no stars, looses the game
      if (gameState.starRating < 1) {
        gameState.currentMusic.stop();
        this.scene.stop('GameScene');
        this.scene.start('LoseScene');
      }

    } else {
      // lose the game if there are no stars
      gameState.currentMusic.stop();
      this.scene.stop('GameScene');
      this.scene.start('LoseScene');
    }
    this.drawStars();
  }

  destroyWave() {
    // play the audible
    gameState.sfx.nextWave.play();

    // hide meter
    gameState.currentCustomer.meterContainer.visible = false;

    // Change text origin after short pause so it's not noticeable to players
    this.time.delayedCall(750, function () {
      gameState.waveTitleText.setOrigin(.5, 1);
      gameState.waveCountText.setOrigin(.5, 0);
    }, [], game);

    // Show the wave count text in the screen center
    this.tweens.add({
      targets: [gameState.waveTitleText, gameState.waveCountText],
      x: gameState.cam.midPoint.x,
      y: gameState.cam.midPoint.y,
      scaleX: 1,
      scaleY: 1,
      duration: 500,
      delay: 750,
      ease: 'Power2',
      onComplete: () => {
        // Change text origin again after pause
        this.time.delayedCall(750, function () {
          gameState.waveTitleText.setOrigin(1, 1);
          gameState.waveCountText.setOrigin(1, 0);
        }, [], game);

        // Get the text back to the same place - wave count text
        this.tweens.add({
          targets: gameState.waveCountText,
          x: gameState.cam.worldView.right - 20,
          y: 30,
          scaleX: .25,
          scaleY: .25,
          duration: 500,
          delay: 750,
          ease: 'Power2'
        });
        
        // Get the text back to the same place - wave title text
        this.tweens.add({
          targets: gameState.waveTitleText,
          x: gameState.cam.worldView.right - 85,
          y: 55,
          scaleX: .25,
          scaleY: .25,
          duration: 500,
          delay: 750,
          ease: 'Power2'
        });
      }
    });

    // move all the wave members
    for (let i = 0; i < gameState.customersServedCount; i++) {
      this.tweens.add({
        targets: gameState.customers.children.entries[i],
        x: '-=300',
        angle: 0,
        duration: 750,
        ease: 'Power2',
        onComplete: () => {
          // move the wave members offscreen
          this.tweens.add({
            targets: gameState.customers.children.entries[i],
            x: '-=900',
            duration: 1200,
            ease: 'Power2',
            onComplete: () => {
              // destroy the old wave
              gameState.customers.clear(true);
              this.generateWave();

              gameState.readyForNextOrder = true;
            }
          });
        }
      });
    }
    this.drawStars();
  }

  restartGame() {
    gameState.score = 0;
    gameState.starRating = 0;
    gameState.currentWaveCount = 1;
    gameState.customersServedCount = 0;
    gameState.readyForNextOrder = true;
    gameState.gameSpeed = 3;
  }
 
} // end of GameScene
