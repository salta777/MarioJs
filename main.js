class Niveau1 extends Phaser.Scene {
    constructor() {
        super('Niveau1');
    }

    preload() {
        this.load.image('bg', 'assets/BackGroundMario.png');
        this.load.image('bloc', 'assets/bloc.png');
        this.load.image('tuyau', 'assets/tuyauRouge.png');
        this.load.image('chateau1', 'assets/chateau1.png');
        this.load.image('drapeau', 'assets/drapeau.png');
        this.load.image('depart', 'assets/depart.png');
        this.load.image('piece1', 'assets/piece1.png');
        this.load.image('piece2', 'assets/piece2.png');
        this.load.image('boom', 'assets/boom.png');

        this.load.image('marioG', 'assets/marioMarcheGauche.png');
        this.load.image('marioD', 'assets/marioMarcheDroite.png');
        this.load.image('marioAG', 'assets/marioArretGauche.png');
        this.load.image('marioAD', 'assets/marioArretDroite.png');
        this.load.image('marioSG', 'assets/marioSautGauche.png');
        this.load.image('marioSD', 'assets/marioSautDroite.png');

        this.load.audio('saut', 'assets/saut.wav');
        this.load.audio('piece', 'assets/piece.wav');
        this.load.audio('boum', 'assets/boum.wav');
        this.load.audio('ecrase', 'assets/ecrasePersonnage.wav');
        this.load.audio('gagne', 'assets/partieGagnee.wav');
        this.load.audio('perdu', 'assets/partiePerdue.wav');
    }

    create() {
        this.add.image(400, 200, 'bg').setScrollFactor(1, 0);
        this.vies = 3;
        this.startTime = this.time.now;

        this.platforms = this.physics.add.staticGroup();
        for (let i = 0; i < 50; i++) {
            this.platforms.create(i * 32, 384, 'bloc').refreshBody();
        }

        this.platforms.create(500, 350, 'tuyau');
        this.platforms.create(1000, 350, 'tuyau');

        this.add.image(100, 320, 'depart').setScale(1.5);
        this.drapeau = this.physics.add.staticImage(1500, 300, 'drapeau');

        this.mario = this.physics.add.sprite(100, 300, 'marioAD').setScale(1.2);
        this.mario.setCollideWorldBounds(true);
        this.physics.add.collider(this.mario, this.platforms);

        this.cameras.main.setBounds(0, 0, 1600, 400);
        this.physics.world.setBounds(0, 0, 1600, 400);
        this.cameras.main.startFollow(this.mario);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.tortue = this.physics.add.sprite(800, 320, 'tortueG');
        this.tortue.setVelocityX(-40);
        this.physics.add.collider(this.tortue, this.platforms);
        this.physics.add.collider(this.mario, this.tortue, this.hitTortue, null, this);

        this.physics.add.overlap(this.mario, this.drapeau, () => {
            this.sound.play('gagne');
            this.scene.start('FinNiveau1', {
                score: this.score,
                time: Math.floor((this.time.now - this.startTime) / 1000)
            });
        });

        this.pieces = this.physics.add.group();
        this.anims.create({
            key: 'coin_anim',
            frames: [{ key: 'piece1' }, { key: 'piece2' }],
            frameRate: 5,
            repeat: -1
        });
        [300, 600, 900, 1200].forEach(x => {
            this.pieces.create(x, 300, 'piece1').play('coin_anim');
        });
        this.physics.add.overlap(this.mario, this.pieces, this.collectPiece, null, this);

        this.score = 0;
        this.scoreText = this.add.text(16, 16, 'Score : 0', { fontSize: '18px', fill: '#000' }).setScrollFactor(0);
        this.viesText = this.add.text(16, 36, 'Vies : 3', { fontSize: '18px', fill: '#000' }).setScrollFactor(0);
    }

    update() {
        if (this.cursors.left.isDown) {
            this.mario.setVelocityX(-150);
            this.mario.setTexture(this.mario.body.onFloor() ? 'marioG' : 'marioSG');
        } else if (this.cursors.right.isDown) {
            this.mario.setVelocityX(150);
            this.mario.setTexture(this.mario.body.onFloor() ? 'marioD' : 'marioSD');
        } else {
            this.mario.setVelocityX(0);
            this.mario.setTexture(this.mario.flipX ? 'marioAG' : 'marioAD');
        }

        if (this.cursors.up.isDown && this.mario.body.onFloor()) {
            this.sound.play('saut');
            this.mario.setVelocityY(-450);
        }

        if (this.tortue.body.blocked.left) {
            this.tortue.setVelocityX(40);
            this.tortue.setTexture('tortueD');
        } else if (this.tortue.body.blocked.right) {
            this.tortue.setVelocityX(-40);
            this.tortue.setTexture('tortueG');
        }
    }

    hitTortue(mario, tortue) {
        if (mario.body.velocity.y > 0) {
            tortue.disableBody(true, true);
            const boom = this.add.image(tortue.x, tortue.y, 'boom').setScale(0.4);
            this.sound.play('boum');
            this.time.delayedCall(300, () => boom.destroy());
            mario.setVelocityY(-200);
        } else {
            this.sound.play('ecrase');
            this.vies -= 1;
            this.viesText.setText('Vies : ' + this.vies);
            if (this.vies <= 0) {
                this.sound.play('perdu');
                this.scene.restart();
            }
        }
    }

    collectPiece(mario, piece) {
        this.sound.play('piece');
        piece.disableBody(true, true);
        this.score += 10;
        this.scoreText.setText('Score : ' + this.score);
    }
}

// === Écran de fin de niveau avec bouton rejouer ===
class FinNiveau1 extends Phaser.Scene {
    constructor() {
        super('FinNiveau1');
    }

    init(data) {
        this.scoreFinal = data.score;
        this.tempsFinal = data.time;
    }

    create() {
        this.add.text(250, 150, 'Niveau terminé !', { fontSize: '26px', fill: '#000' });
        this.add.text(250, 200, 'Score : ' + this.scoreFinal, { fontSize: '20px', fill: '#000' });
        this.add.text(250, 230, 'Temps : ' + this.tempsFinal + ' sec', { fontSize: '20px', fill: '#000' });

        const btn = this.add.text(250, 280, '↻ Rejouer le niveau', { fontSize: '22px', fill: '#0077ff' })
            .setInteractive()
            .on('pointerdown', () => this.scene.start('Niveau1'));
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 400,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: false
        }
    },
    scene: [Niveau1, FinNiveau1]
};

const game = new Phaser.Game(config);
