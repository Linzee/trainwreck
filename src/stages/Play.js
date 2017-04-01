import World from '../world/World';
import Train from '../world/Train';
import SwitchCursor from '../world/SwitchCursor';
import KeyListener from '../common/KeyListener';

export default class StagePlay extends PIXI.Container {

	constructor(stages, settings) {
		super();
		
		this.stages = stages;
		this.settings = settings;
		this.cameraPosPercentage = 0.21;
	}

	load() {
		this.camOffset = this.cameraPosPercentage * this.settings.width;

		this.world = new World();
		this.world.y = this.settings.height / 2;

		this.train = new Train(this.world, 0, 0, Train.RIGHT);
		this.train.x = World.PIECE_WIDTH2;
		this.train.y = this.settings.height / 2 + World.PIECE_HEIGHT2;

		this.switchCursor = new SwitchCursor(this.train);
		this.switchCursor.y = this.settings.height / 2;

		this.cartsText = new PIXI.Text("0", new PIXI.TextStyle({fontSize: 40, fill: '#FFFFFF'}));
		this.cartsText.x = 16;
		this.cartsText.y = 16;

		this.crashedText = new PIXI.Text("Crashed", new PIXI.TextStyle({fontSize: 40, fill: '#FFFFFF'}));
		this.crashedText.x = this.settings.width / 2;
		this.crashedText.y = this.settings.height / 2;
		this.crashedText.anchor.x = 0.5;
		this.crashedText.anchor.y = 0.5;
		this.crashedText.visible = false;

		this.addChild(this.world);
		this.addChild(this.train);
		this.addChild(this.switchCursor);
		this.addChild(this.cartsText);
		this.addChild(this.crashedText);

		this.keyUp = new KeyListener(38);
		this.keyDown = new KeyListener(40);
		this.keyLeft = new KeyListener(37);
		this.keyRight = new KeyListener(39);
		this.keySpace = new KeyListener(32);
	}

	tick() {
		this.train.move();
		
		if(!this.train.isCrashed) {
			this.switchCursor.recalculatePosition();
		}

		//move camera
		var camPos = this.train.locomotive.x - this.camOffset;
		if(this.train.isCrashed) {
			this.camOffset += 0.8;
		}
		if(camPos < 0) {
			camPos = 0;
		}
		camPos += World.PIECE_WIDTH;
		this.world.x = -camPos;
		this.train.x = -camPos + World.PIECE_WIDTH2;
		this.switchCursor.x = -camPos;
		
		//show/hide world
		var c1 = camPos + this.settings.width + 5 * World.PIECE_WIDTH;
		var c2 = camPos - 10 * World.PIECE_WIDTH;
		if(c1 > this.world.displayed.to * World.PIECE_WIDTH || c2 < this.world.displayed.from * World.PIECE_WIDTH) {
			var from = Math.floor(camPos / World.PIECE_WIDTH) - 30;
			var to = from + 100;
			var oldTo = this.world.displayed.to;

			this.world.clamp(from, to);
			
			if(to > oldTo) {
				this.train.recalculatePath(oldTo);
				this.switchCursor.displayPath();
			}
		}

		//controls
		if(!this.train.isCrashed) {
			if(this.keyUp.isDown) {
				this.switchCursor.switchCursor(0);
			}
			if(this.keyDown.isDown) {
				this.switchCursor.switchCursor(1);
			}
			if(this.keyLeft.isDown) {
				if(Train.MIN_SPEED === undefined || this.train.speed > Train.MIN_SPEED) {
					this.train.speed -= Train.SPEED_CHANGE_STEP;
				}
			}
			if(this.keyRight.isDown) {
				if(Train.MAX_SPEED === undefined || this.train.speed < Train.MAX_SPEED) {
					this.train.speed += Train.SPEED_CHANGE_STEP;
				}
			}
		}
		if(this.keySpace.isDown) {
			this.restart();
		}

		this.cartsText.text = this.train.getCartCount();

		if(this.train.isCrashed) {
			this.crashedText.visible = true;
		}
	}

	restart() {
		this.unload();
		this.load();
	}

	unload() {
		this.removeChild(this.world);
		this.removeChild(this.train);
		this.removeChild(this.switchCursor);
		this.removeChild(this.cartsText);
		this.removeChild(this.crashedText);
		
		this.keyUp.close();
		this.keyDown.close();
		this.keyLeft.close();
		this.keyRight.close();
		this.keySpace.close();

		this.keyUp = undefined;
		this.keyDown = undefined;
		this.keyLeft = undefined;
		this.keyRight = undefined;
		this.keySpace = undefined;

		this.world = undefined;
		this.train = undefined;
		this.switchCursor = undefined;
		this.cartsText = undefined;
		this.crashedText = undefined;
	}
}
